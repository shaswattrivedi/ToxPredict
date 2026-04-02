# Documentation & Visualizations

This directory contains figures and visualizations generated during model development and evaluation.

## Contents

### Model Performance

- **`model_performance.png`** — ROC-AUC scores for all 12 toxicity assay classifiers
- **`meta_model_coefficients.png`** — Weights learned by the ensemble meta-model

### Explainability

- **`shap_summary_NR-AhR.png`** — SHAP summary plot for the Aryl Hydrocarbon Receptor assay, showing feature importance across the test set
- **`feature_importance.png`** — Aggregate feature importance across all models

## Generating New Figures

Visualizations are generated from the Jupyter notebooks in `backend/ml/notebooks/`:

1. `03_training_evaluation.ipynb` — Model performance plots
2. `03b_ensemble_stacking.ipynb` — Meta-model coefficient analysis
3. `04_shap_explainability.ipynb` — SHAP summary and waterfall plots

## Usage

These figures can be referenced in:
- Project presentations
- Research documentation
- The About page of the web application
