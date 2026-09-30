import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from transformers import AutoModel, AutoTokenizer


# ============================================================
# CONFIG
# ============================================================

MODEL_NAME = "google/muril-base-cased"

# Portable paths for the GitHub repository.
# drishti_startup.py -> ml-service/inference/
# parents[1]         -> ml-service/
SERVICE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = SERVICE_DIR / "model"

MASTER_PATH = MODEL_DIR / "FINAL_PROJECT_CHECKPOINT.pt"
X_VAL_PATH = MODEL_DIR / "X_val.npy"
VALIDATION_PATH = MODEL_DIR / "validation_df.pkl"
PIPELINE_PATH = SERVICE_DIR / "inference" / "inference_pipeline.py"


# ============================================================
# EXACT CHECKPOINT ARCHITECTURES
# ============================================================


class SIFHead(nn.Module):
    def __init__(self, input_dim=768):
        super().__init__()
        self.classifier = nn.Linear(input_dim, 1)

    def forward(self, x):
        return torch.sigmoid(self.classifier(x))


class LSRHead(nn.Module):
    def __init__(self, input_dim=768, num_labels=7):
        super().__init__()
        self.classifier = nn.Linear(input_dim, num_labels)

    def forward(self, x):
        return torch.sigmoid(self.classifier(x))


class BarrierFailureHead(nn.Module):
    def __init__(self, input_dim=768, num_classes=5):
        super().__init__()
        self.classifier = nn.Linear(input_dim, num_classes)

    def forward(self, x):
        return torch.softmax(self.classifier(x), dim=1)


class BarrierFunctionMLP(nn.Module):
    def __init__(self, input_dim=768, hidden_dim=256, num_classes=4):
        super().__init__()
        self.classifier = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.10),
            nn.Linear(hidden_dim, num_classes),
        )

    def forward(self, x):
        return self.classifier(x)


# ============================================================
# SYSTEM CONTAINER
# ============================================================


class DrishtiAI:
    """Load the frozen Drishti ML stack and expose report analysis."""

    def __init__(self):
        required = [MASTER_PATH, X_VAL_PATH, VALIDATION_PATH, PIPELINE_PATH]
        missing = [str(path) for path in required if not path.exists()]

        if missing:
            raise FileNotFoundError(
                "Missing Drishti ML runtime files:\n" + "\n".join(missing)
            )

        # ----------------------------------------------------
        # Load master checkpoint
        # ----------------------------------------------------
        self.checkpoint = torch.load(
            MASTER_PATH,
            map_location="cpu",
            weights_only=False,
        )

        # ----------------------------------------------------
        # Load tokenizer + frozen MuRIL encoder
        # ----------------------------------------------------
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

        self.muril = AutoModel.from_pretrained(MODEL_NAME)
        self.muril.eval()

        for parameter in self.muril.parameters():
            parameter.requires_grad = False

        # ----------------------------------------------------
        # Restore trained heads
        # ----------------------------------------------------
        self.sif_head = SIFHead()
        self.lsr_head = LSRHead()
        self.barrier_failure_head = BarrierFailureHead()
        self.barrier_function_mlp = BarrierFunctionMLP()

        self.sif_head.load_state_dict(self.checkpoint["sif_head"])
        self.lsr_head.load_state_dict(self.checkpoint["lsr_head"])
        self.barrier_failure_head.load_state_dict(
            self.checkpoint["barrier_failure_head"]
        )
        self.barrier_function_mlp.load_state_dict(
            self.checkpoint["barrier_function_mlp"]
        )

        self.sif_head.eval()
        self.lsr_head.eval()
        self.barrier_failure_head.eval()
        self.barrier_function_mlp.eval()

        # ----------------------------------------------------
        # Frozen validation artifacts used by the pipeline
        # ----------------------------------------------------
        self.X_val = np.load(X_VAL_PATH)
        self.validation_df = pd.read_pickle(VALIDATION_PATH)

        # ----------------------------------------------------
        # Load reusable inference pipeline
        # ----------------------------------------------------
        import importlib.util

        spec = importlib.util.spec_from_file_location(
            "drishti_inference_pipeline",
            PIPELINE_PATH,
        )

        if spec is None or spec.loader is None:
            raise ImportError(f"Could not load inference pipeline: {PIPELINE_PATH}")

        module = importlib.util.module_from_spec(spec)
        sys.modules["drishti_inference_pipeline"] = module
        spec.loader.exec_module(module)

        self.pipeline = module

        # ----------------------------------------------------
        # Inject runtime objects expected by analyze_report()
        # ----------------------------------------------------
        module.tokenizer = self.tokenizer
        module.muril = self.muril
        module.loaded_sif_head = self.sif_head
        module.loaded_lsr_head = self.lsr_head
        module.loaded_barrier_failure_head = self.barrier_failure_head
        module.loaded_barrier_function_mlp = self.barrier_function_mlp

    # --------------------------------------------------------
    # Public API
    # --------------------------------------------------------

    def analyze_report(self, report_text: str):
        if not isinstance(report_text, str) or not report_text.strip():
            raise ValueError("report_text must be a non-empty string")

        return self.pipeline.analyze_report(report_text.strip())


# ============================================================
# PUBLIC LOADER
# ============================================================


def load_drishti_ai():
    """Create and verify a ready-to-use DrishtiAI instance."""
    system = DrishtiAI()

    # Startup sanity checks based on the verified checkpoint.
    assert system.X_val.shape == (96, 768), (
        f"Unexpected X_val shape: {system.X_val.shape}"
    )
    assert system.validation_df.shape == (96, 40), (
        f"Unexpected validation_df shape: {system.validation_df.shape}"
    )

    return system
