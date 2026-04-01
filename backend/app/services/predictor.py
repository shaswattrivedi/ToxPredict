import joblib
import numpy as np
import time
import logging
from pathlib import Path

from app.services.mol_processor import (
	extract_features,
	mol_to_highlighted_image_b64,
	mol_to_image_b64,
	check_structural_alerts,
	compute_drug_likeness,
)
from app.services.explainer import (
	get_shap_explanation,
	generate_compound_narrative,
)
from app.models.schemas import (
	AssayResult,
	PredictionResponse,
	ErrorResponse,
	StructuralAlert,
	DrugLikeness,
	SHAPFeature,
	ASSAY_METADATA,
)

logger = logging.getLogger(__name__)


MODELS_DIR = Path(__file__).parent.parent.parent.parent / "ml" / "trained_models"
_ALT_MODELS_DIR = Path(__file__).parent.parent.parent / "ml" / "trained_models"
ASSAY_COLUMNS = [
	"NR-AR",
	"NR-AR-LBD",
	"NR-AhR",
	"NR-Aromatase",
	"NR-ER",
	"NR-ER-LBD",
	"NR-PPAR-gamma",
	"SR-ARE",
	"SR-ATAD5",
	"SR-HSE",
	"SR-MMP",
	"SR-p53",
]


_models: dict = {}
_meta_model = None
_prediction_cache: dict = {}


def load_models() -> tuple[dict, object]:
	"""
	Loads all 12 base XGBoost models + meta-model from disk.
	Called once at FastAPI startup via lifespan context.
	Returns (models_dict, meta_model).
	Logs success/failure per model.
	"""
	model_dir = MODELS_DIR
	if not model_dir.exists() and _ALT_MODELS_DIR.exists():
		model_dir = _ALT_MODELS_DIR
		logger.info("Using fallback model directory: %s", model_dir)

	models = {}
	for assay in ASSAY_COLUMNS:
		path = model_dir / f"model_{assay}.joblib"
		if path.exists():
			models[assay] = joblib.load(path)
			logger.info(f"Loaded base model: {assay}")
		else:
			logger.warning(f"Base model not found: {assay}")

	meta_path = model_dir / "meta_model.joblib"
	meta = None
	if meta_path.exists():
		meta = joblib.load(meta_path)
		logger.info("Loaded meta-model (ensemble stacking)")
	else:
		logger.warning("Meta-model not found - will use mean probability fallback")

	return models, meta


def set_models(models: dict, meta_model):
	global _models, _meta_model
	_models = models
	_meta_model = meta_model


def get_models() -> dict:
	return _models


def get_cache_size() -> int:
	return len(_prediction_cache)


def _get_risk_level(probability: float) -> str:
	if probability >= 0.7:
		return "High"
	if probability >= 0.4:
		return "Medium"
	return "Low"


def _get_confidence(probability: float) -> str:
	if probability >= 0.8 or probability <= 0.2:
		return "High"
	if probability >= 0.65 or probability <= 0.35:
		return "Medium"
	return "Low"


def _compute_overall_risk(
	assay_probs: list[float],
	meta_model,
) -> tuple[str, float]:
	"""
	Computes overall risk using meta-model if available,
	falls back to weighted mean probability.

	Returns (risk_level, probability).
	"""
	if meta_model is not None and len(assay_probs) == 12:
		try:
			meta_input = np.array(assay_probs).reshape(1, -1)
			meta_prob = float(meta_model.predict_proba(meta_input)[0, 1])
			return _get_risk_level(meta_prob), meta_prob
		except Exception as e:
			logger.warning(f"Meta-model failed, using fallback: {e}")

	mean_prob = float(np.mean(assay_probs))
	return _get_risk_level(mean_prob), mean_prob


def predict(smiles: str) -> PredictionResponse | ErrorResponse:
	"""
	Full two-stage ensemble prediction pipeline.

	Pipeline:
	1. Check prediction cache
	2. Validate SMILES and extract features
	3. Stage 1: Run all 12 XGBoost base models
	4. Stage 2: Run meta-model for overall risk score
	5. SHAP explanation for highest-risk assay
	6. Structural alerts (PAINS + Brenk)
	7. Drug-likeness (Lipinski + QED)
	8. Molecule image generation
	9. Assemble and cache response

	Returns PredictionResponse on success, ErrorResponse on failure.
	Never raises exceptions.
	"""
	start_time = time.time()

	if smiles in _prediction_cache:
		cached = _prediction_cache[smiles]
		logger.info(f"Cache hit for SMILES: {smiles[:20]}...")
		return cached.model_copy(update={"cached": True})

	try:
		features = extract_features(smiles)
		if features is None:
			return ErrorResponse(
				error="Invalid SMILES",
				detail=(
					"Could not parse molecular structure. "
					"Please check your SMILES string."
				),
				smiles=smiles,
			)

		assay_results = []
		assay_probs = []

		for assay in ASSAY_COLUMNS:
			model = _models.get(assay)
			if model is None:
				assay_probs.append(0.5)
				continue

			prob = float(model.predict_proba(features.reshape(1, -1))[0, 1])
			is_toxic = prob >= 0.5
			meta = ASSAY_METADATA.get(
				assay,
				{
					"display_name": assay,
					"category": "Unknown",
				},
			)

			assay_results.append(
				AssayResult(
					assay_name=assay,
					display_name=meta["display_name"],
					category=meta["category"],
					is_toxic=is_toxic,
					probability=round(prob, 4),
					risk_level=_get_risk_level(prob),
					confidence=_get_confidence(prob),
				)
			)
			assay_probs.append(prob)

		overall_risk, overall_score = _compute_overall_risk(assay_probs, _meta_model)
		toxic_count = sum(1 for r in assay_results if r.is_toxic)

		shap_features: list[SHAPFeature] = []
		narrative = ""

		if assay_results:
			top_assay_result = max(assay_results, key=lambda r: r.probability)
			top_model = _models.get(top_assay_result.assay_name)

			if top_model is not None:
				raw_shap_features = get_shap_explanation(
					features,
					top_model,
					top_assay_result.assay_name,
					top_n=15,
				)
				shap_features = [SHAPFeature(**item) for item in raw_shap_features]
				narrative = generate_compound_narrative(
					raw_shap_features,
					top_assay_result.assay_name,
					top_assay_result.probability,
					top_assay_result.is_toxic,
				)

		raw_alerts = check_structural_alerts(smiles)
		structural_alerts = [
			StructuralAlert(
				alert_type=a["alert_type"],
				alert_name=a["alert_name"],
				description=a["description"],
			)
			for a in raw_alerts
		]

		dl = compute_drug_likeness(smiles)
		drug_likeness = DrugLikeness(
			lipinski_pass=dl["lipinski_pass"],
			violations=dl["violations"],
			qed_score=dl["qed_score"],
			molecular_weight=dl["molecular_weight"],
			log_p=dl["log_p"],
			h_bond_donors=dl["h_bond_donors"],
			h_bond_acceptors=dl["h_bond_acceptors"],
			interpretation=dl["interpretation"],
		)

		img_b64 = mol_to_highlighted_image_b64(smiles, shap_features)

		processing_ms = (time.time() - start_time) * 1000

		response = PredictionResponse(
			smiles=smiles,
			is_valid_smiles=True,
			assay_results=assay_results,
			toxic_assay_count=toxic_count,
			overall_risk=overall_risk,
			overall_risk_score=round(overall_score, 4),
			overall_risk_score_source="ensemble_meta_model",
			top_shap_features=shap_features,
			narrative=narrative,
			structural_alerts=structural_alerts,
			has_structural_alerts=len(structural_alerts) > 0,
			drug_likeness=drug_likeness,
			molecule_image_b64=img_b64,
			processing_time_ms=round(processing_ms, 2),
			cached=False,
		)

		if len(_prediction_cache) < 500:
			_prediction_cache[smiles] = response

		return response

	except Exception as e:
		logger.error(f"Prediction failed for {smiles[:20]}: {e}")
		return ErrorResponse(
			error="Prediction failed",
			detail=str(e),
			smiles=smiles,
		)
