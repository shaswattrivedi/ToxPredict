from contextlib import asynccontextmanager
import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.routes.predict import router
from app.services.predictor import load_models, set_models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
	# ── Startup ──
	logger.info("ToxPredict API starting up...")
	logger.info("Loading ML models (Stage 1: 12 XGBoost + Stage 2: meta-model)...")
	models, meta_model = load_models()
	set_models(models, meta_model)
	logger.info(f"Loaded {len(models)} base models + meta-model: {meta_model is not None}")
	logger.info("ToxPredict API ready.")
	yield
	# ── Shutdown ──
	logger.info("ToxPredict API shutting down.")


app = FastAPI(
	title="ToxPredict API",
	description="""
	Drug toxicity prediction using a two-stage ensemble:
	Stage 1: 12 XGBoost classifiers (mean ROC-AUC: 0.835)
	Stage 2: Calibrated logistic regression meta-model (ROC-AUC: 0.916)
	Trained on Tox21 dataset (~7,800 compounds, 12 biological assays)
	""",
	version="2.0.0",
	lifespan=lifespan,
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
	start = time.time()
	response = await call_next(request)
	duration = (time.time() - start) * 1000
	logger.info(
		f"{request.method} {request.url.path} "
		f"→ {response.status_code} ({duration:.1f}ms)"
	)
	return response


app.include_router(router)


@app.get("/")
async def root():
	return {
		"message": "ToxPredict API — Two-Stage Drug Toxicity Prediction",
		"docs": "/docs",
		"health": "/api/health",
		"architecture": {
			"stage_1": "12 XGBoost classifiers (ROC-AUC 0.835)",
			"stage_2": "Ensemble meta-model (ROC-AUC 0.916)",
			"explainability": "SHAP TreeExplainer + biological narratives",
			"alerts": "PAINS + Brenk structural filters",
			"drug_likeness": "Lipinski Rule of Five + QED",
		},
	}
