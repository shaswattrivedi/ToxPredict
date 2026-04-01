from fastapi import APIRouter, HTTPException

from app.models.schemas import PredictionRequest, PredictionResponse, ErrorResponse
from app.services.predictor import predict, get_cache_size

router = APIRouter(prefix="/api", tags=["prediction"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Predict drug toxicity from SMILES",
    description="""
    Accepts a SMILES molecular structure string and returns:
    - 12 individual assay toxicity predictions (Stage 1)
    - Overall ensemble risk score via meta-model (Stage 2)
    - SHAP feature importance with biological explanations
    - Compound narrative paragraph
    - Structural alerts (PAINS + Brenk)
    - Drug-likeness assessment (Lipinski + QED)
    - 2D molecular structure image
    """,
)
async def predict_toxicity(request: PredictionRequest):
    result = predict(request.smiles)
    if isinstance(result, ErrorResponse):
        raise HTTPException(
            status_code=422,
            detail=result.model_dump(),
        )
    return result


@router.get("/health")
async def health_check():
    from app.services.predictor import get_models, _meta_model

    models = get_models()
    return {
        "status": "healthy",
        "models_loaded": len(models),
        "meta_model_loaded": _meta_model is not None,
        "cache_size": get_cache_size(),
        "version": "2.0.0",
    }


@router.get("/examples")
async def get_examples():
    return {
        "examples": [
            {
                "name": "Aspirin",
                "smiles": "CC(=O)Oc1ccccc1C(=O)O",
                "description": "Common analgesic — expected low toxicity",
                "expected_risk": "Low-Medium",
            },
            {
                "name": "Caffeine",
                "smiles": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
                "description": "Common stimulant — expected low toxicity",
                "expected_risk": "Low",
            },
            {
                "name": "Tamoxifen",
                "smiles": "CCC(=C(c1ccccc1)c1ccc(OCCN(C)C)cc1)c1ccccc1",
                "description": "Breast cancer drug — strong receptor activity",
                "expected_risk": "Medium-High",
            },
            {
                "name": "Pyrene",
                "smiles": "c1cc2ccc3cccc4ccc(c1)c2c34",
                "description": "Polycyclic aromatic hydrocarbon — known carcinogen",
                "expected_risk": "High",
            },
        ]
    }


@router.delete("/cache")
async def clear_cache():
    """Clears the prediction cache. Useful for testing."""
    from app.services.predictor import _prediction_cache

    size = len(_prediction_cache)
    _prediction_cache.clear()
    return {"cleared": size, "message": f"Cleared {size} cached predictions"}
