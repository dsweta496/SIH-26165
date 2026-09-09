from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from inference.udyam_startup import load_udyam_ai


class ReportRequest(BaseModel):
    report_text: str = Field(..., min_length=1)


ml_system = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global ml_system
    print("[Udyam AI] Loading model and inference pipeline...")
    ml_system = load_udyam_ai()
    print("[Udyam AI] Model loaded successfully.")
    yield
    ml_system = None


app = FastAPI(
    title="Udyam AI ML Service",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    return {
        "status": "ok" if ml_system is not None else "starting",
        "model": "FINAL_41_5Y_B",
        "encoder": "google/muril-base-cased",
    }


@app.post("/analyze-report")
def analyze_report(request: ReportRequest):
    if ml_system is None:
        raise HTTPException(status_code=503, detail="ML model is not loaded")

    try:
        return ml_system.analyze_report(request.report_text)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        print(f"[Udyam AI] Inference error: {exc}")
        raise HTTPException(status_code=500, detail="ML inference failed") from exc
