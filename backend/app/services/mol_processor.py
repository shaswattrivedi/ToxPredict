"""Molecular processing utilities for ToxPredict."""

import base64
import io
import logging

import numpy as np
from rdkit import Chem, RDLogger
from rdkit.Chem import AllChem, Descriptors, Draw, QED, rdMolDescriptors
from rdkit.Chem.Draw import rdMolDraw2D
from rdkit.Chem.FilterCatalog import FilterCatalog, FilterCatalogParams

RDLogger.DisableLog("rdApp.*")
logger = logging.getLogger(__name__)

_DESCRIPTOR_NAMES = [
    "MolWt",
    "MolLogP",
    "TPSA",
    "NumHBD",
    "NumHBA",
    "NumRotatableBonds",
    "NumAromaticRings",
    "NumAliphaticRings",
    "HeavyAtomCount",
    "FractionCSP3",
    "NumAromaticHeterocycles",
    "NumSaturatedRings",
    "fr_aldehyde",
    "fr_epoxide",
    "fr_halogen",
    "fr_NH0",
    "fr_NH1",
    "fr_NH2",
    "RingCount",
    "NumRadicalElectrons",
]

# Initialize filter catalogs once at module level (expensive operation)
_pains_catalog = None
_brenk_catalog = None


def validate_smiles(smiles: str) -> bool:
    """Returns True if SMILES is parseable by RDKit."""
    try:
        if not isinstance(smiles, str) or not smiles.strip():
            return False
        return Chem.MolFromSmiles(smiles) is not None
    except Exception:
        logger.exception("Failed to validate SMILES")
        return False


def smiles_to_mol(smiles: str):
    """Returns RDKit mol object or None."""
    try:
        if not isinstance(smiles, str) or not smiles.strip():
            return None
        return Chem.MolFromSmiles(smiles)
    except Exception:
        logger.exception("Failed to parse SMILES into molecule")
        return None


def extract_features(smiles: str) -> np.ndarray | None:
    """
    Full pipeline: SMILES -> Morgan fingerprint (2048 bits, radius=2)
    + RDKit descriptors (20 features) -> float32 array of shape (2068,)

    Descriptor order (MUST match feature_names.json exactly):
    MolWt, MolLogP, TPSA, NumHBD, NumHBA, NumRotatableBonds,
    NumAromaticRings, NumAliphaticRings, HeavyAtomCount, FractionCSP3,
    NumAromaticHeterocycles, NumSaturatedRings, fr_aldehyde, fr_epoxide,
    fr_halogen, fr_NH0, fr_NH1, fr_NH2, RingCount, NumRadicalElectrons

    Returns None if SMILES is invalid. Never raises.
    """
    try:
        mol = smiles_to_mol(smiles)
        if mol is None:
            return None

        mol_h = Chem.AddHs(mol)
        fp = AllChem.GetMorganFingerprintAsBitVect(mol_h, radius=2, nBits=2048)
        fingerprint_array = np.fromiter(
            (int(bit) for bit in fp.ToBitString()),
            dtype=np.float32,
            count=2048,
        )

        descriptor_array = np.array(
            [
                Descriptors.MolWt(mol),
                Descriptors.MolLogP(mol),
                Descriptors.TPSA(mol),
                rdMolDescriptors.CalcNumHBD(mol),
                rdMolDescriptors.CalcNumHBA(mol),
                rdMolDescriptors.CalcNumRotatableBonds(mol),
                rdMolDescriptors.CalcNumAromaticRings(mol),
                rdMolDescriptors.CalcNumAliphaticRings(mol),
                Descriptors.HeavyAtomCount(mol),
                Descriptors.FractionCSP3(mol),
                rdMolDescriptors.CalcNumAromaticHeterocycles(mol),
                rdMolDescriptors.CalcNumSaturatedRings(mol),
                Descriptors.fr_aldehyde(mol),
                Descriptors.fr_epoxide(mol),
                Descriptors.fr_halogen(mol),
                Descriptors.fr_NH0(mol),
                Descriptors.fr_NH1(mol),
                Descriptors.fr_NH2(mol),
                Descriptors.RingCount(mol),
                Descriptors.NumRadicalElectrons(mol),
            ],
            dtype=np.float32,
        )

        return np.concatenate([fingerprint_array, descriptor_array]).astype(np.float32)
    except Exception:
        logger.exception("Failed to extract features")
        return None


def get_feature_names() -> list[str]:
    """Returns list of 2068 feature names in exact extraction order."""
    try:
        morgan_names = [f"morgan_bit_{i}" for i in range(2048)]
        return morgan_names + _DESCRIPTOR_NAMES
    except Exception:
        logger.exception("Failed to construct feature names")
        return []


def mol_to_image_b64(smiles: str, size: tuple = (300, 300)) -> str:
    """
    Generates 2D molecule structure image.
    Returns base64-encoded PNG string.
    Returns empty string if invalid SMILES.
    White background, clean rendering.
    """
    try:
        mol = smiles_to_mol(smiles)
        if mol is None:
            return ""

        image = Draw.MolToImage(mol, size=size)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        return base64.b64encode(buffer.getvalue()).decode("utf-8")
    except Exception:
        logger.exception("Failed to render molecule image")
        return ""


def mol_to_highlighted_image_b64(
    smiles: str,
    shap_features: list[dict],
    size: tuple = (400, 300),
) -> str:
    """
    Generates a 2D molecule image with atoms highlighted based on
    SHAP-active Morgan fingerprint bits.

    Red highlights = atoms contributing to increases_toxicity features.
    Green highlights = atoms contributing to reduces_toxicity features.

    Only morgan_bit_X features are atom-mapped; named descriptors are skipped.

    Returns base64 PNG. Returns plain molecule image if no highlight bits are
    available. Returns empty string if SMILES is invalid.
    """
    try:
        mol = smiles_to_mol(smiles)
        if mol is None:
            return ""

        bit_info: dict[int, list[tuple[int, int]]] = {}
        AllChem.GetMorganFingerprintAsBitVect(
            mol,
            radius=2,
            nBits=2048,
            bitInfo=bit_info,
        )

        toxic_atoms: set[int] = set()
        protective_atoms: set[int] = set()

        for feature in shap_features:
            name = str(feature.get("feature_name", ""))
            direction = str(feature.get("direction", ""))

            if not name.startswith("morgan_bit_"):
                continue

            try:
                bit_num = int(name.split("_")[-1])
            except Exception:
                continue

            if bit_num not in bit_info:
                continue

            for atom_idx, _radius in bit_info[bit_num]:
                if direction == "increases_toxicity":
                    toxic_atoms.add(atom_idx)
                else:
                    protective_atoms.add(atom_idx)

        highlight_atom_colors: dict[int, tuple[float, float, float]] = {}
        highlight_atoms: list[int] = []

        for atom_idx in toxic_atoms:
            highlight_atoms.append(atom_idx)
            highlight_atom_colors[atom_idx] = (1.0, 0.4, 0.4)

        for atom_idx in protective_atoms:
            if atom_idx not in toxic_atoms:
                highlight_atoms.append(atom_idx)
                highlight_atom_colors[atom_idx] = (0.4, 0.9, 0.4)

        drawer = rdMolDraw2D.MolDraw2DCairo(int(size[0]), int(size[1]))
        drawer.drawOptions().addStereoAnnotation = False

        if highlight_atoms:
            drawer.DrawMolecule(
                mol,
                highlightAtoms=highlight_atoms,
                highlightAtomColors=highlight_atom_colors,
                highlightBonds=[],
                highlightBondColors={},
            )
        else:
            drawer.DrawMolecule(mol)

        drawer.FinishDrawing()
        png_data = drawer.GetDrawingText()
        return base64.b64encode(png_data).decode("utf-8")
    except Exception:
        logger.exception("Failed to generate highlighted molecule image")
        return mol_to_image_b64(smiles, size)


def _get_pains_catalog() -> FilterCatalog:
    global _pains_catalog
    try:
        if _pains_catalog is None:
            params = FilterCatalogParams()
            params.AddCatalog(FilterCatalogParams.FilterCatalogs.PAINS)
            _pains_catalog = FilterCatalog(params)
        return _pains_catalog
    except Exception:
        logger.exception("Failed to initialize PAINS catalog")
        return FilterCatalog(FilterCatalogParams())


def _get_brenk_catalog() -> FilterCatalog:
    global _brenk_catalog
    try:
        if _brenk_catalog is None:
            params = FilterCatalogParams()
            params.AddCatalog(FilterCatalogParams.FilterCatalogs.BRENK)
            _brenk_catalog = FilterCatalog(params)
        return _brenk_catalog
    except Exception:
        logger.exception("Failed to initialize Brenk catalog")
        return FilterCatalog(FilterCatalogParams())


def check_structural_alerts(smiles: str) -> list[dict]:
    """
    Checks compound against PAINS and Brenk structural alert filters.

    PAINS (Pan Assay Interference Compounds): 480 patterns known to
    produce false positives in biological assays.

    Brenk: 105 fragments associated with toxicity, poor
    pharmacokinetics, or chemical instability.

    Returns empty list if no alerts or invalid SMILES. Never raises.
    """
    try:
        mol = smiles_to_mol(smiles)
        if mol is None:
            return []

        alerts: list[dict] = []

        pains = _get_pains_catalog()
        pains_matches = pains.GetMatches(mol)
        for match in pains_matches:
            description = match.GetDescription()
            alerts.append(
                {
                    "alert_type": "PAINS",
                    "alert_name": description,
                    "description": (
                        "Pan-assay interference pattern detected: "
                        f"'{description}' is known to produce false positives "
                        "in biological assays through non-specific mechanisms. "
                        "Experimental results for this compound class should "
                        "be interpreted with caution."
                    ),
                }
            )

        brenk = _get_brenk_catalog()
        brenk_matches = brenk.GetMatches(mol)
        for match in brenk_matches:
            description = match.GetDescription()
            alerts.append(
                {
                    "alert_type": "Brenk",
                    "alert_name": description,
                    "description": (
                        "Structural liability detected: "
                        f"'{description}' is associated with toxicity, "
                        "chemical instability, or poor pharmacokinetic "
                        "properties in medicinal chemistry literature."
                    ),
                }
            )

        return alerts
    except Exception:
        logger.exception("Failed to check structural alerts")
        return []


def compute_drug_likeness(smiles: str) -> dict:
    """
    Computes Lipinski Rule of Five compliance and QED drug-likeness score.

    Returns dict with all required properties. Returns invalid payload
    with defaults if SMILES is invalid. Never raises.
    """
    try:
        mol = smiles_to_mol(smiles)
        if mol is None:
            return {
                "lipinski_pass": False,
                "violations": ["Invalid SMILES"],
                "qed_score": 0.0,
                "molecular_weight": 0.0,
                "log_p": 0.0,
                "h_bond_donors": 0,
                "h_bond_acceptors": 0,
                "interpretation": "Could not compute drug-likeness: invalid SMILES",
            }

        mw = Descriptors.MolWt(mol)
        logp = Descriptors.MolLogP(mol)
        hbd = rdMolDescriptors.CalcNumHBD(mol)
        hba = rdMolDescriptors.CalcNumHBA(mol)
        qed_score = QED.qed(mol)

        violations: list[str] = []
        if mw > 500:
            violations.append(f"MW > 500 ({mw:.1f} Da)")
        if logp > 5:
            violations.append(f"logP > 5 ({logp:.2f})")
        if hbd > 5:
            violations.append(f"H-bond donors > 5 ({hbd})")
        if hba > 10:
            violations.append(f"H-bond acceptors > 10 ({hba})")

        lipinski_pass = len(violations) == 0

        if lipinski_pass and qed_score >= 0.6:
            interpretation = (
                "Excellent drug-likeness: passes all Lipinski rules "
                f"with QED score {qed_score:.2f}/1.0. Predicted good "
                "oral bioavailability."
            )
        elif lipinski_pass and qed_score >= 0.4:
            interpretation = (
                "Good drug-likeness: passes all Lipinski rules "
                f"with moderate QED score {qed_score:.2f}/1.0."
            )
        elif (not lipinski_pass) and len(violations) == 1:
            interpretation = (
                "Borderline drug-likeness: 1 Lipinski violation "
                f"({violations[0]}). QED: {qed_score:.2f}/1.0. "
                "May have reduced oral bioavailability."
            )
        else:
            interpretation = (
                f"Poor drug-likeness: {len(violations)} Lipinski "
                f"violations. QED: {qed_score:.2f}/1.0. "
                "Likely poor oral bioavailability."
            )

        return {
            "lipinski_pass": lipinski_pass,
            "violations": violations,
            "qed_score": round(qed_score, 3),
            "molecular_weight": round(mw, 2),
            "log_p": round(logp, 3),
            "h_bond_donors": hbd,
            "h_bond_acceptors": hba,
            "interpretation": interpretation,
        }
    except Exception:
        logger.exception("Failed to compute drug-likeness")
        return {
            "lipinski_pass": False,
            "violations": ["Computation failed"],
            "qed_score": 0.0,
            "molecular_weight": 0.0,
            "log_p": 0.0,
            "h_bond_donors": 0,
            "h_bond_acceptors": 0,
            "interpretation": "Could not compute drug-likeness due to an internal error",
        }


if __name__ == "__main__":
    aspirin = "CC(=O)Oc1ccccc1C(=O)O"
    pains_like = "O=C1CSc2ccccc21"

    print("=== ASPIRIN ===")
    aspirin_features = extract_features(aspirin)
    print(
        "1) extract_features:",
        None if aspirin_features is None else aspirin_features.shape,
        None if aspirin_features is None else aspirin_features.dtype,
    )

    aspirin_img = mol_to_image_b64(aspirin)
    print("2) mol_to_image_b64 length:", len(aspirin_img))

    print("3) check_structural_alerts (aspirin):", check_structural_alerts(aspirin))
    print("3) check_structural_alerts (PAINS-like):", check_structural_alerts(pains_like))

    print("4) compute_drug_likeness (aspirin):", compute_drug_likeness(aspirin))
    print("4) compute_drug_likeness (PAINS-like):", compute_drug_likeness(pains_like))
