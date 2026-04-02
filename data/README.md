# Data Directory

This directory is for dataset files used in model training and evaluation.

## Structure

```
data/
├── raw/           # Original source datasets (e.g., Tox21 CSV)
├── processed/     # Cleaned and feature-engineered datasets
└── README.md
```

## Primary Dataset: Tox21

The models are trained on the [Tox21 dataset](https://tripod.nih.gov/tox21/) from the US National Toxicology Program:

- **~7,800 compounds** tested across 12 biological assays
- **12 toxicity endpoints** covering nuclear receptor and stress response pathways
- **Binary labels** indicating whether a compound triggers a toxic response

### Assay Categories

**Nuclear Receptor Panel:**
- NR-AR (Androgen Receptor)
- NR-AR-LBD (Androgen Receptor Ligand-Binding Domain)
- NR-AhR (Aryl Hydrocarbon Receptor)
- NR-Aromatase
- NR-ER (Estrogen Receptor Alpha)
- NR-ER-LBD (Estrogen Receptor LBD)
- NR-PPAR-gamma

**Stress Response Panel:**
- SR-ARE (Antioxidant Response Element)
- SR-ATAD5 (Genotoxicity)
- SR-HSE (Heat Shock Element)
- SR-MMP (Mitochondrial Membrane Potential)
- SR-p53 (p53 Tumor Suppressor)

## Notes

- Raw data files are not committed to version control due to size
- Processed feature matrices are stored in `backend/ml/processed/`
- Download the original Tox21 dataset from [Kaggle](https://www.kaggle.com/datasets/bioinformaticsu/tox21-dataset) or [NIH](https://tripod.nih.gov/tox21/)
