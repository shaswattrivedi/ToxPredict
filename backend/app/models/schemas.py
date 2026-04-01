from pydantic import BaseModel, Field, field_validator
from typing import Optional


# ── Request ──────────────────────────────────────────────────────

class PredictionRequest(BaseModel):
	smiles: str = Field(
		...,
		min_length=2,
		max_length=500,
		description="SMILES string representing the molecular structure",
		examples=["CC(=O)Oc1ccccc1C(=O)O"]
	)

	@field_validator('smiles')
	@classmethod
	def clean_smiles(cls, v):
		cleaned = v.strip()
		if not cleaned:
			raise ValueError("SMILES string cannot be empty")
		allowed = set('CNOSPFClBrIcnospf[]()=#+\\/-@.0123456789%HhBb')
		if not all(c in allowed for c in cleaned):
			raise ValueError("SMILES contains invalid characters")
		return cleaned


# ── Sub-models ───────────────────────────────────────────────────

class SHAPFeature(BaseModel):
	feature_name: str
	shap_value: float
	direction: str        # "increases_toxicity" | "reduces_toxicity"
	feature_value: float
	rank: int
	insight: str          # biological explanation sentence


class AssayResult(BaseModel):
	assay_name: str
	display_name: str     # e.g. "Androgen Receptor"
	category: str         # "Nuclear Receptor" | "Stress Response"
	is_toxic: bool
	probability: float = Field(ge=0.0, le=1.0)
	risk_level: str       # "High" | "Medium" | "Low"
	confidence: str       # "High" | "Medium" | "Low"


class StructuralAlert(BaseModel):
	alert_type: str       # "PAINS" | "Brenk"
	alert_name: str       # e.g. "rhodanine"
	description: str      # plain English explanation


class DrugLikeness(BaseModel):
	lipinski_pass: bool
	violations: list[str]           # list of violated rules
	qed_score: float = Field(ge=0.0, le=1.0)
	molecular_weight: float
	log_p: float
	h_bond_donors: int
	h_bond_acceptors: int
	interpretation: str             # plain English summary


# ── Main Response ─────────────────────────────────────────────────

class PredictionResponse(BaseModel):
	smiles: str
	is_valid_smiles: bool

	# Stage 1: individual assay predictions
	assay_results: list[AssayResult]
	toxic_assay_count: int

	# Stage 2: meta-model overall score
	overall_risk: str               # "High" | "Medium" | "Low"
	overall_risk_score: float       # meta-model probability output
	overall_risk_score_source: str  # "ensemble_meta_model" always

	# Explainability
	top_shap_features: list[SHAPFeature]
	narrative: str                  # compound narrative paragraph

	# Drug characterization
	structural_alerts: list[StructuralAlert]
	has_structural_alerts: bool
	drug_likeness: DrugLikeness

	# Molecule display
	molecule_image_b64: str

	# Meta
	processing_time_ms: float
	cached: bool


# ── Error & Utility ───────────────────────────────────────────────

class ErrorResponse(BaseModel):
	error: str
	detail: str
	smiles: Optional[str] = None


class HealthResponse(BaseModel):
	status: str
	models_loaded: int
	meta_model_loaded: bool
	cache_size: int
	version: str


# ── Assay Metadata ────────────────────────────────────────────────
# Used in predictor.py to enrich AssayResult objects

ASSAY_METADATA = {
	"NR-AR":        {
		"display_name": "Androgen Receptor",
		"category": "Nuclear Receptor"
	},
	"NR-AR-LBD":    {
		"display_name": "Androgen Receptor LBD",
		"category": "Nuclear Receptor"
	},
	"NR-AhR":       {
		"display_name": "Aryl Hydrocarbon Receptor",
		"category": "Nuclear Receptor"
	},
	"NR-Aromatase": {
		"display_name": "Aromatase",
		"category": "Nuclear Receptor"
	},
	"NR-ER":        {
		"display_name": "Estrogen Receptor Alpha",
		"category": "Nuclear Receptor"
	},
	"NR-ER-LBD":    {
		"display_name": "Estrogen Receptor LBD",
		"category": "Nuclear Receptor"
	},
	"NR-PPAR-gamma":{
		"display_name": "PPAR Gamma",
		"category": "Nuclear Receptor"
	},
	"SR-ARE":       {
		"display_name": "Antioxidant Response",
		"category": "Stress Response"
	},
	"SR-ATAD5":     {
		"display_name": "Genotoxicity (ATAD5)",
		"category": "Stress Response"
	},
	"SR-HSE":       {
		"display_name": "Heat Shock Response",
		"category": "Stress Response"
	},
	"SR-MMP":       {
		"display_name": "Mitochondrial Membrane",
		"category": "Stress Response"
	},
	"SR-p53":       {
		"display_name": "p53 Tumor Suppressor",
		"category": "Stress Response"
	},
}
