"""Molecular processing utilities for Tox21 inference and training consistency."""

from __future__ import annotations

import base64
import io
import warnings
from typing import Any

import numpy as np

warnings.filterwarnings("ignore")

_RDKIT_AVAILABLE = True

try:
    from rdkit import Chem
    from rdkit import DataStructs
    from rdkit import RDLogger
    from rdkit.Chem import AllChem
    from rdkit.Chem import Descriptors
    from rdkit.Chem import Draw
    from rdkit.Chem import rdMolDescriptors
    from rdkit.Chem.rdchem import Mol

    RDLogger.DisableLog("rdApp.*")
except Exception:
    _RDKIT_AVAILABLE = False
    Chem = None  # type: ignore[assignment]
    DataStructs = None  # type: ignore[assignment]
    AllChem = None  # type: ignore[assignment]
    Descriptors = None  # type: ignore[assignment]
    Draw = None  # type: ignore[assignment]
    rdMolDescriptors = None  # type: ignore[assignment]
    Mol = Any  # type: ignore[assignment]


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


def validate_smiles(smiles: str) -> bool:
    """Returns True if SMILES is valid, False otherwise."""
    if not _RDKIT_AVAILABLE:
        return False
    if not isinstance(smiles, str) or not smiles.strip():
        return False

    try:
        return Chem.MolFromSmiles(smiles) is not None
    except Exception:
        return False


def smiles_to_mol(smiles: str) -> Mol | None:
    """Returns RDKit mol object or None."""
    if not _RDKIT_AVAILABLE:
        return None
    if not isinstance(smiles, str) or not smiles.strip():
        return None

    try:
        return Chem.MolFromSmiles(smiles)
    except Exception:
        return None


def extract_features(smiles: str) -> np.ndarray | None:
    """
    Full pipeline: SMILES -> validated mol -> Morgan fingerprint (2048 bits,
    radius=2) + RDKit descriptors (20 features) -> concatenated float32 array.

    Returns None if SMILES is invalid.

    Descriptors in this exact order:
    MolWt, MolLogP, TPSA, NumHBD, NumHBA, NumRotatableBonds,
    NumAromaticRings, NumAliphaticRings, HeavyAtomCount, FractionCSP3,
    NumAromaticHeterocycles, NumSaturatedRings, fr_aldehyde, fr_epoxide,
    fr_halogen, fr_NH0, fr_NH1, fr_NH2, RingCount, NumRadicalElectrons
    """
    if not _RDKIT_AVAILABLE:
        return None

    try:
        mol = smiles_to_mol(smiles)
        if mol is None:
            return None

        # Add explicit hydrogens before generating Morgan bits.
        mol_h = Chem.AddHs(mol)

        fp = AllChem.GetMorganFingerprintAsBitVect(mol_h, radius=2, nBits=2048)
        fingerprint_array = np.zeros((2048,), dtype=np.float32)
        DataStructs.ConvertToNumpyArray(fp, fingerprint_array)

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

        feature_vector = np.concatenate([fingerprint_array, descriptor_array]).astype(np.float32)
        return feature_vector
    except Exception:
        return None


def get_feature_names() -> list[str]:
    """Returns list of 2068 feature names: morgan_bit_0..2047 + 20 descriptor names."""
    morgan_names = [f"morgan_bit_{i}" for i in range(2048)]
    return morgan_names + _DESCRIPTOR_NAMES


def mol_to_image_b64(smiles: str, size: tuple = (300, 300)) -> str:
    """
    Renders 2D molecule structure image using RDKit Draw.MolToImage().

    Returns base64-encoded PNG string. Returns empty string if invalid SMILES.
    """
    if not _RDKIT_AVAILABLE:
        return ""

    try:
        mol = smiles_to_mol(smiles)
        if mol is None:
            return ""

        image = Draw.MolToImage(mol, size=size)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        img_bytes = buffer.getvalue()
        return base64.b64encode(img_bytes).decode("utf-8")
    except Exception:
        return ""


if __name__ == "__main__":
    aspirin = "CC(=O)Oc1ccccc1C(=O)O"

    print("SMILES:", aspirin)

    is_valid = validate_smiles(aspirin)
    print("validate_smiles:", is_valid)

    mol_obj = smiles_to_mol(aspirin)
    print("smiles_to_mol is not None:", mol_obj is not None)

    features = extract_features(aspirin)
    print("extract_features shape:", None if features is None else features.shape)

    names = get_feature_names()
    print("feature name count:", len(names))

    image_b64 = mol_to_image_b64(aspirin)
    print("mol_to_image_b64 non-empty:", len(image_b64) > 0)
