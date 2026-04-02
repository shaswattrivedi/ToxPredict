# ToxPredict

**Computational Drug Toxicity Prediction with Explainable AI**

ToxPredict is a web application that predicts the toxicity of drug-like compounds using a two-stage machine learning ensemble trained on the [Tox21 dataset](https://tripod.nih.gov/tox21/). It provides explainable predictions using SHAP (SHapley Additive exPlanations) to help researchers understand which molecular features drive toxicity risk.

> 🏆 Built for the **CodeCure Hackathon @ IIT BHU SPIRIT 2026** (Track A)

---

## ✨ Key Features

- **12 Toxicity Assay Predictions** — Nuclear receptor and stress response pathway predictions
- **Two-Stage Ensemble Architecture** — XGBoost classifiers + calibrated meta-model (ROC-AUC: 0.916)
- **SHAP Explainability** — Understand which molecular features contribute to predictions
- **Structural Alerts** — PAINS and Brenk filter detection for problematic substructures
- **Drug-Likeness Assessment** — Lipinski Rule of Five compliance and QED score
- **Interactive Visualization** — Radar charts, SHAP bar plots, and molecular structure rendering

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ToxPredict                              │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite + Tailwind)                             │
│  └── SMILES Input → API Call → Results Dashboard                │
├─────────────────────────────────────────────────────────────────┤
│  Backend (FastAPI + RDKit + XGBoost)                            │
│  ├── Stage 1: 12 XGBoost classifiers (per-assay predictions)    │
│  ├── Stage 2: Logistic regression meta-model (overall risk)     │
│  ├── SHAP TreeExplainer (feature attribution)                   │
│  └── Structural alerts (PAINS + Brenk filters)                  │
├─────────────────────────────────────────────────────────────────┤
│  ML Pipeline (Jupyter Notebooks)                                │
│  └── EDA → Feature Engineering → Training → Evaluation → SHAP   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with docs at `/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 📊 Model Performance

| Assay | Biological Target | ROC-AUC |
|-------|-------------------|---------|
| NR-AhR | Aryl Hydrocarbon Receptor | 0.899 |
| SR-MMP | Mitochondrial Membrane Potential | 0.938 |
| SR-ATAD5 | Genotoxicity | 0.876 |
| NR-Aromatase | Aromatase | 0.876 |
| SR-p53 | p53 Tumor Suppressor | 0.873 |
| NR-PPAR-gamma | PPAR Gamma | 0.856 |
| SR-ARE | Antioxidant Response | 0.853 |
| NR-ER-LBD | Estrogen Receptor LBD | 0.807 |
| NR-AR-LBD | Androgen Receptor LBD | 0.799 |
| SR-HSE | Heat Shock Response | 0.790 |
| NR-AR | Androgen Receptor | 0.759 |
| NR-ER | Estrogen Receptor Alpha | 0.690 |

**Mean ROC-AUC:** 0.835 | **Meta-model ROC-AUC:** 0.916

---

## 🗂️ Repository Structure

```
ToxPredict/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # ML inference, SHAP, molecule processing
│   │   ├── models/           # Pydantic schemas
│   │   └── utils/            # Helper functions
│   ├── ml/
│   │   ├── notebooks/        # Training & analysis notebooks
│   │   ├── trained_models/   # Serialized XGBoost + meta-model
│   │   └── processed/        # Feature matrices & metadata
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Home, About pages
│   │   ├── hooks/            # Custom React hooks
│   │   └── api/              # API client
│   ├── public/
│   └── package.json
├── data/                     # Dataset documentation
├── docs/                     # ML visualizations & figures
└── README.md
```

---

## 🔬 Technology Stack

### Backend / ML
- **XGBoost** — 12 gradient-boosted toxicity classifiers
- **Scikit-learn** — Ensemble stacking meta-model
- **RDKit** — Molecular feature extraction & visualization
- **SHAP** — TreeExplainer for prediction attribution
- **FastAPI** — High-performance ML serving API
- **Pydantic** — Request/response validation

### Frontend
- **React 19 + Vite** — Interactive prediction interface
- **Recharts** — SHAP bar charts and radar visualization
- **Tailwind CSS** — Utility-first styling
- **React Query** — API state management

---

## ⚠️ Important Disclaimer

ToxPredict predicts toxicity as measured in Tox21 high-throughput screening assays. These assays use fixed concentrations (typically 1-100 μM) that may differ from therapeutic plasma concentrations in humans.

**This tool is intended for early-stage computational screening and research purposes. All predictions should be validated experimentally before any clinical or regulatory conclusions are drawn.**

---

## 📄 License

This project was created for the CodeCure Hackathon @ IIT BHU SPIRIT 2026.

---

## 👥 Team

Built with ❤️ for advancing computational drug safety research.