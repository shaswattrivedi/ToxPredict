"""Production SHAP explainability service for ToxPredict.

This module provides three layers:
1) SHAP computation
2) Feature interpretation
3) Compound-level narrative generation
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import numpy as np
import shap

logger = logging.getLogger(__name__)

_FEATURE_NAMES_PATH = (
    Path(__file__).parent.parent.parent.parent
    / "ml"
    / "processed"
    / "feature_names.json"
)

_ALT_FEATURE_NAMES_PATH = (
    Path(__file__).parent.parent.parent
    / "ml"
    / "processed"
    / "feature_names.json"
)

try:
    with open(_FEATURE_NAMES_PATH, "r", encoding="utf-8") as _fh:
        FEATURE_NAMES: list[str] = json.load(_fh)
except FileNotFoundError:
    try:
        with open(_ALT_FEATURE_NAMES_PATH, "r", encoding="utf-8") as _fh:
            FEATURE_NAMES = json.load(_fh)
    except Exception as exc:
        logger.error(
            "Failed to load feature names from %s (primary missing) and %s: %s",
            _FEATURE_NAMES_PATH,
            _ALT_FEATURE_NAMES_PATH,
            exc,
        )
        FEATURE_NAMES = []
except Exception as exc:
    logger.error("Failed to load feature names from %s: %s", _FEATURE_NAMES_PATH, exc)
    FEATURE_NAMES = []

_explainer_cache: dict[str, shap.TreeExplainer] = {}


FEATURE_INSIGHTS = {
    "MolLogP": {
        "increases_toxicity": (
            "High lipophilicity (logP={val:.1f}) enables membrane penetration and cellular "
            "accumulation, increasing exposure to intracellular targets including nuclear receptors."
        ),
        "reduces_toxicity": (
            "Low lipophilicity (logP={val:.1f}) limits membrane penetration and cellular "
            "accumulation, reducing systemic toxicity risk."
        ),
    },
    "TPSA": {
        "increases_toxicity": (
            "Low polar surface area ({val:.0f} A^2) indicates a non-polar molecule that crosses "
            "biological membranes easily, increasing bioavailability to intracellular targets."
        ),
        "reduces_toxicity": (
            "High polar surface area ({val:.0f} A^2) restricts passive membrane diffusion, "
            "limiting cellular uptake and intracellular target exposure."
        ),
    },
    "NumAromaticRings": {
        "increases_toxicity": (
            "This molecule contains {val:.0f} aromatic ring(s). Polycyclic aromatic systems are "
            "canonical AhR ligands and are associated with DNA intercalation and carcinogenic activity."
        ),
        "reduces_toxicity": (
            "Low aromatic ring count reduces AhR activation risk and DNA intercalation potential."
        ),
    },
    "NumAliphaticRings": {
        "increases_toxicity": (
            "{val:.0f} aliphatic ring(s) create a steroid-like scaffold common in hormones like "
            "testosterone and estrogen, explaining potential nuclear receptor (NR-AR, NR-ER) activation."
        ),
        "reduces_toxicity": (
            "Low aliphatic ring count reduces structural similarity to endogenous steroid hormones, "
            "lowering nuclear receptor activation risk."
        ),
    },
    "MolWt": {
        "increases_toxicity": (
            "Molecular weight of {val:.0f} Da indicates a large molecule with potentially complex "
            "metabolism, increasing the probability of reactive metabolite formation."
        ),
        "reduces_toxicity": (
            "Low molecular weight ({val:.0f} Da) facilitates rapid renal clearance, reducing systemic "
            "exposure duration."
        ),
    },
    "FractionCSP3": {
        "increases_toxicity": (
            "Low sp3 carbon fraction ({val:.2f}) indicates a predominantly flat, aromatic structure. "
            "Planar molecules intercalate DNA base pairs and are associated with genotoxicity."
        ),
        "reduces_toxicity": (
            "High sp3 carbon fraction ({val:.2f}) indicates 3D molecular shape, reducing DNA "
            "intercalation risk and improving selectivity."
        ),
    },
    "RingCount": {
        "increases_toxicity": (
            "Total ring count of {val:.0f} indicates a polycyclic structure. Multiple fused rings "
            "create planar electron-rich systems that interact strongly with biological macromolecules."
        ),
        "reduces_toxicity": "Low ring count reduces structural complexity and non-specific biological interaction risk.",
    },
    "NumHDonors": {
        "increases_toxicity": (
            "{val:.0f} hydrogen bond donor(s) enable strong interactions with polar binding sites in "
            "nuclear receptors, a key pharmacophoric feature for receptor-ligand binding."
        ),
        "reduces_toxicity": "Low H-bond donor count limits specific protein-receptor interactions.",
    },
    "NumHAcceptors": {
        "increases_toxicity": (
            "{val:.0f} hydrogen bond acceptor(s) complement the binding pocket geometry of nuclear "
            "receptors including NR-ER and NR-AR."
        ),
        "reduces_toxicity": "Low H-bond acceptor count reduces complementarity with receptor binding pockets.",
    },
    "NumRotatableBonds": {
        "increases_toxicity": (
            "{val:.0f} rotatable bonds increase conformational flexibility, enabling this molecule to "
            "adopt shapes required for diverse receptor binding pockets."
        ),
        "reduces_toxicity": (
            "Low conformational flexibility restricts the molecule from fitting into receptor "
            "binding pockets."
        ),
    },
    "fr_aldehyde": {
        "increases_toxicity": (
            "Aldehyde group detected. Aldehydes are reactive electrophiles that covalently modify "
            "lysine and cysteine residues in proteins, triggering direct cellular damage and stress "
            "response pathways."
        ),
        "reduces_toxicity": "No aldehyde groups detected, reducing direct protein alkylation risk.",
    },
    "fr_epoxide": {
        "increases_toxicity": (
            "Epoxide group detected. Epoxides are highly reactive and alkylate DNA directly. Many "
            "carcinogens act through epoxide intermediates formed during hepatic metabolism."
        ),
        "reduces_toxicity": "No epoxide groups detected, reducing genotoxicity risk.",
    },
    "fr_halogen": {
        "increases_toxicity": (
            "Halogen atom(s) detected. Halogens increase metabolic stability and lipophilicity. "
            "Halogenated compounds like DDT and PCBs are persistent bioaccumulative toxins."
        ),
        "reduces_toxicity": (
            "No halogen atoms detected. Halogen-free structures have shorter biological half-lives and "
            "reduced bioaccumulation potential."
        ),
    },
    "fr_NH0": {
        "increases_toxicity": (
            "Tertiary amine detected. Amines are metabolically activated to N-oxide or hydroxylamine "
            "species, which are reactive intermediates associated with idiosyncratic toxicity."
        ),
        "reduces_toxicity": "No tertiary amine detected, reducing amine-mediated metabolic activation risk.",
    },
    "HeavyAtomCount": {
        "increases_toxicity": (
            "High heavy atom count ({val:.0f}) indicates molecular complexity. Complex molecules generate "
            "diverse metabolic products, increasing the probability of toxic metabolite formation."
        ),
        "reduces_toxicity": (
            "Low molecular complexity ({val:.0f} heavy atoms) reduces metabolic diversity and toxic "
            "metabolite risk."
        ),
    },
    "NumAromaticHeterocycles": {
        "increases_toxicity": (
            "{val:.0f} aromatic heterocycle(s) detected. Heteroaromatic systems are common in reactive "
            "intermediates and mutagens that intercalate DNA."
        ),
        "reduces_toxicity": "No aromatic heterocycles detected, reducing DNA intercalation and reactive intermediate risk.",
    },
    "NumSaturatedRings": {
        "increases_toxicity": (
            "{val:.0f} saturated ring(s) contribute to a rigid 3D scaffold. Saturated ring systems appear "
            "in many bioactive steroids and terpenoids with receptor activity."
        ),
        "reduces_toxicity": "Low saturated ring count reduces scaffold rigidity and steroidal character.",
    },
    "fr_NH1": {
        "increases_toxicity": (
            "Secondary amine detected. Secondary amines can be oxidized to reactive hydroxylamine species "
            "and are associated with hematotoxicity in some compound classes."
        ),
        "reduces_toxicity": "No secondary amine detected.",
    },
    "fr_NH2": {
        "increases_toxicity": (
            "Primary amine detected. Primary aromatic amines are metabolically activated to electrophilic "
            "nitrenium ions that form DNA adducts, a classic carcinogenicity mechanism."
        ),
        "reduces_toxicity": "No primary amine detected, reducing nitrenium ion formation risk.",
    },
    "NumRadicalElectrons": {
        "increases_toxicity": "Unpaired electrons detected. Radical species cause direct oxidative damage to DNA, proteins, and lipids.",
        "reduces_toxicity": "No radical electrons detected.",
    },
    # Aliases to match generated descriptor names used in training.
    "NumHBD": {
        "increases_toxicity": (
            "{val:.0f} hydrogen bond donor(s) enable strong interactions with polar binding sites in "
            "nuclear receptors, a key pharmacophoric feature for receptor-ligand binding."
        ),
        "reduces_toxicity": "Low H-bond donor count limits specific protein-receptor interactions.",
    },
    "NumHBA": {
        "increases_toxicity": (
            "{val:.0f} hydrogen bond acceptor(s) complement the binding pocket geometry of nuclear "
            "receptors including NR-ER and NR-AR."
        ),
        "reduces_toxicity": "Low H-bond acceptor count reduces complementarity with receptor binding pockets.",
    },
}

MORGAN_BIT_INSIGHT = {
    "increases_toxicity": (
        "A molecular substructure pattern (fingerprint bit {bit_num}) recurred consistently in "
        "confirmed toxic compounds during training on the Tox21 dataset, indicating a structurally-"
        "encoded toxicity signal for this assay."
    ),
    "reduces_toxicity": (
        "A molecular substructure pattern (fingerprint bit {bit_num}) appeared frequently in non-toxic "
        "compounds during training, suggesting a protective structural motif for this assay."
    ),
}

ASSAY_BIOLOGICAL_CONTEXT = {
    "NR-AR": "androgen receptor activation (testosterone signaling pathway)",
    "NR-AR-LBD": "androgen receptor ligand binding domain interaction",
    "NR-AhR": "Aryl Hydrocarbon Receptor activation (carcinogen detection pathway)",
    "NR-Aromatase": "aromatase enzyme inhibition (estrogen biosynthesis disruption)",
    "NR-ER": "estrogen receptor alpha activation (estrogenic disruption)",
    "NR-ER-LBD": "estrogen receptor ligand binding domain interaction",
    "NR-PPAR-gamma": "PPAR-gamma activation (fat metabolism and adipogenesis disruption)",
    "SR-ARE": "oxidative stress and antioxidant response pathway activation",
    "SR-ATAD5": "DNA damage and genotoxicity (ATAD5 reporter activation)",
    "SR-HSE": "heat shock response and protein stress pathway",
    "SR-MMP": "mitochondrial membrane potential disruption",
    "SR-p53": "p53 tumor suppressor activation (DNA damage marker)",
}


def _extract_binary_shap_vector(raw: Any) -> np.ndarray:
    """Normalize SHAP outputs to a single-feature vector for one sample."""
    try:
        if isinstance(raw, list):
            return np.asarray(raw[1][0] if len(raw) > 1 else raw[0][0], dtype=float)

        arr = np.asarray(raw, dtype=float)
        if arr.ndim == 3:
            class_idx = 1 if arr.shape[2] > 1 else 0
            return arr[0, :, class_idx]
        if arr.ndim == 2:
            return arr[0]
        if arr.ndim == 1:
            return arr
        return np.array([], dtype=float)
    except Exception as exc:
        logger.error("Failed to normalize SHAP output: %s", exc)
        return np.array([], dtype=float)


def _feature_names_for_vector(length: int) -> list[str]:
    """Return aligned feature names, falling back to generated names when needed."""
    if FEATURE_NAMES and len(FEATURE_NAMES) == length:
        return FEATURE_NAMES
    return [f"feature_{idx}" for idx in range(length)]


def _risk_bucket(probability: float) -> str:
    """Return textual risk bucket from probability."""
    if probability >= 0.7:
        return "HIGH"
    if probability >= 0.5:
        return "MODERATE"
    return "LOW"


def _get_explainer(model: Any, assay_name: str) -> shap.TreeExplainer:
    """Cache TreeExplainers - expensive to create, cheap to reuse."""
    try:
        if assay_name not in _explainer_cache:
            _explainer_cache[assay_name] = shap.TreeExplainer(model)
        return _explainer_cache[assay_name]
    except Exception as exc:
        logger.error("Failed to create/get SHAP explainer for assay %s: %s", assay_name, exc)
        # Type ignore is intentional so callers can fail gracefully without exceptions.
        return None  # type: ignore[return-value]


def generate_feature_insight(
    feature_name: str,
    direction: str,
    feature_value: float,
) -> str:
    """
    Convert a raw SHAP feature into a human-readable biological explanation.

    Uses FEATURE_INSIGHTS for named descriptors and MORGAN_BIT_INSIGHT for
    fingerprint bits. Falls back to a generic message on error.
    """
    fallback = (
        f"Feature '{feature_name}' has value {feature_value:.4f} and "
        f"{direction.replace('_', ' ')} in this prediction."
    )

    try:
        if feature_name.startswith("morgan_bit_"):
            bit_num = feature_name.split("_")[-1]
            template = MORGAN_BIT_INSIGHT.get(direction)
            if template is None:
                return fallback
            return template.format(bit_num=bit_num)

        canonical_key = {
            "NumHBD": "NumHDonors",
            "NumHBA": "NumHAcceptors",
        }.get(feature_name, feature_name)

        if canonical_key in FEATURE_INSIGHTS:
            template = FEATURE_INSIGHTS[canonical_key].get(direction)
            if template is None:
                return fallback
            return template.format(val=float(feature_value))

        return fallback
    except Exception as exc:
        logger.error("Failed to generate feature insight for %s: %s", feature_name, exc)
        return fallback


def get_shap_explanation(
    feature_vector: np.ndarray,
    model: Any,
    assay_name: str,
    top_n: int = 15,
) -> list[dict[str, Any]]:
    """
    Compute SHAP values and return top features with metadata.

    Returns each feature entry as:
    {
        "feature_name": str,
        "shap_value": float,
        "direction": "increases_toxicity" | "reduces_toxicity",
        "feature_value": float,
        "rank": int,
        "insight": str
    }
    """
    try:
        vector = np.asarray(feature_vector, dtype=float).reshape(-1)
        if vector.size == 0:
            return []

        explainer = _get_explainer(model, assay_name)
        if explainer is None:
            return []

        raw = explainer.shap_values(vector.reshape(1, -1))
        sv = _extract_binary_shap_vector(raw)
        if sv.size == 0:
            return []

        names = _feature_names_for_vector(len(vector))
        limit = min(int(top_n), len(sv), len(vector), len(names))
        if limit <= 0:
            return []

        ranked_idx = np.argsort(np.abs(sv))[::-1][:limit]

        response: list[dict[str, Any]] = []
        for rank, idx in enumerate(ranked_idx, start=1):
            shap_value = float(sv[idx])
            feature_value = float(vector[idx])
            direction = "increases_toxicity" if shap_value >= 0 else "reduces_toxicity"

            response.append(
                {
                    "feature_name": str(names[idx]),
                    "shap_value": shap_value,
                    "direction": direction,
                    "feature_value": feature_value,
                    "rank": rank,
                    "insight": generate_feature_insight(str(names[idx]), direction, feature_value),
                }
            )

        return response
    except Exception as exc:
        logger.error("Failed to compute SHAP explanation for assay %s: %s", assay_name, exc)
        return []


def generate_compound_narrative(
    shap_features: list[dict[str, Any]],
    assay_name: str,
    probability: float,
    is_toxic: bool,
) -> str:
    """
    Build a coherent paragraph explaining a compound prediction in one assay.

    Uses assay context plus top directional SHAP drivers to generate a
    confidence-aware narrative.
    """
    context = ASSAY_BIOLOGICAL_CONTEXT.get(assay_name, assay_name)
    fallback = (
        f"Prediction: {_risk_bucket(probability)} toxicity risk for {context} "
        f"(probability: {probability:.0%})."
    )

    try:
        if not shap_features:
            return fallback

        desired_direction = "increases_toxicity" if is_toxic else "reduces_toxicity"
        filtered = [
            feat for feat in shap_features if feat.get("direction") == desired_direction
        ]

        if not filtered:
            return fallback

        filtered = sorted(
            filtered,
            key=lambda item: abs(float(item.get("shap_value", 0.0))),
            reverse=True,
        )[:3]

        insights = [
            str(item.get("insight", "")).strip()
            for item in filtered
            if str(item.get("insight", "")).strip()
        ]

        if not insights:
            return fallback

        insight_1 = insights[0]
        insight_2 = insights[1] if len(insights) > 1 else ""
        insight_3 = insights[2] if len(insights) > 2 else ""

        if is_toxic and probability >= 0.7:
            narrative = (
                f"This compound shows HIGH toxicity risk for {context} "
                f"(probability: {probability:.0%}). The primary structural driver is: "
                f"{insight_1}."
            )
            if insight_2:
                narrative += f" Furthermore, {insight_2}."
            if insight_3:
                narrative += f" {insight_3}."
            return narrative

        if is_toxic and probability >= 0.5:
            narrative = (
                f"This compound shows MODERATE toxicity risk for {context} "
                f"(probability: {probability:.0%}). Contributing structural factors include: "
                f"{insight_1}."
            )
            if insight_2:
                narrative += f" {insight_2}."
            return narrative

        narrative = (
            f"This compound is predicted SAFE for {context} "
            f"(confidence: {(1.0 - probability):.0%}). Protective structural features include: "
            f"{insight_1}."
        )
        if insight_2:
            narrative += f" {insight_2}."
        return narrative
    except Exception as exc:
        logger.error("Failed to generate narrative for assay %s: %s", assay_name, exc)
        return fallback


def get_top_features_across_assays(
    feature_vector: np.ndarray,
    models: dict[str, Any],
    top_n: int = 10,
) -> list[dict[str, Any]]:
    """
    Compute mean absolute SHAP values across all assays for one compound.

    Returns each feature entry as:
    {
        "feature_name": str,
        "mean_abs_shap": float,
        "feature_value": float,
        "rank": int,
        "insight": str
    }
    """
    try:
        vector = np.asarray(feature_vector, dtype=float).reshape(-1)
        if vector.size == 0 or not models:
            return []

        per_assay_abs: list[np.ndarray] = []
        for assay_name, model in models.items():
            if model is None:
                continue

            explainer = _get_explainer(model, assay_name)
            if explainer is None:
                continue

            raw = explainer.shap_values(vector.reshape(1, -1))
            sv = _extract_binary_shap_vector(raw)
            if sv.size != vector.size:
                continue

            per_assay_abs.append(np.abs(sv))

        if not per_assay_abs:
            return []

        mean_abs = np.mean(np.vstack(per_assay_abs), axis=0)
        names = _feature_names_for_vector(len(vector))

        limit = min(int(top_n), len(mean_abs), len(names), len(vector))
        if limit <= 0:
            return []

        top_idx = np.argsort(mean_abs)[::-1][:limit]

        response: list[dict[str, Any]] = []
        for rank, idx in enumerate(top_idx, start=1):
            feature_name = str(names[idx])
            feature_value = float(vector[idx])
            response.append(
                {
                    "feature_name": feature_name,
                    "mean_abs_shap": float(mean_abs[idx]),
                    "feature_value": feature_value,
                    "rank": rank,
                    "insight": generate_feature_insight(
                        feature_name=feature_name,
                        direction="increases_toxicity",
                        feature_value=feature_value,
                    ),
                }
            )

        return response
    except Exception as exc:
        logger.error("Failed to compute cross-assay SHAP summary: %s", exc)
        return []


if __name__ == "__main__":
    try:
        import joblib

        try:
            from app.services.mol_processor import extract_features
        except Exception:
            try:
                from backend.app.services.mol_processor import extract_features
            except Exception:
                from mol_processor import extract_features

        assay = "NR-AhR"
        smiles = "CC(=O)Oc1ccccc1C(=O)O"

        backend_dir = Path(__file__).parent.parent.parent
        model_path = backend_dir / "ml" / "trained_models" / f"model_{assay}.joblib"

        if not model_path.exists():
            print(f"Model not found: {model_path}")
        else:
            model = joblib.load(model_path)
            vector = extract_features(smiles)

            if vector is None:
                print("Failed to extract features for aspirin SMILES")
            else:
                probability = float(model.predict_proba(vector.reshape(1, -1))[0, 1])
                is_toxic = probability > 0.5

                shap_top3 = get_shap_explanation(
                    feature_vector=vector,
                    model=model,
                    assay_name=assay,
                    top_n=3,
                )

                narrative = generate_compound_narrative(
                    shap_features=shap_top3,
                    assay_name=assay,
                    probability=probability,
                    is_toxic=is_toxic,
                )

                print(f"Assay: {assay}")
                print(f"Probability: {probability:.3f} | Prediction: {'TOXIC' if is_toxic else 'SAFE'}")

                print("\nRaw SHAP top 3:")
                for item in shap_top3:
                    print(
                        f"- {item['feature_name']}: shap={item['shap_value']:.6f}, "
                        f"value={item['feature_value']:.4f}, dir={item['direction']}"
                    )

                print("\nFeature insights:")
                for item in shap_top3:
                    print(f"- {item['insight']}")

                print("\nNarrative:")
                print(narrative)
    except Exception as exc:
        logger.error("__main__ test failed in explainer.py: %s", exc)
        print("Explainer smoke test failed; check logs for details.")
