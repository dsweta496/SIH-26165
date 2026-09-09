import os
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel

MODEL_NAME = "google/muril-base-cased"

# Portable paths: everything required by the ML runtime lives inside ml-service/.
SERVICE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = SERVICE_DIR / "model"
PIPELINE_PATH = SERVICE_DIR / "inference" / "inference_pipeline.py"

MASTER_PATH = MODEL_DIR / "FINAL_PROJECT_CHECKPOINT.pt"
X_VAL_PATH = MODEL_DIR / "X_val.npy"
VALIDATION_PATH = MODEL_DIR / "validation_df.pkl"


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


class UdyamAI:
    def __init__(self):
        required = [MASTER_PATH, X_VAL_PATH, VALIDATION_PATH, PIPELINE_PATH]
        missing = [str(path) for path in required if not path.exists()]
        if missing:
            raise FileNotFoundError(
                "Missing ML runtime files:\n" + "\n".join(missing)
            )

        self.checkpoint = torch.load(
            MASTER_PATH,
            map_location="cpu",
            weights_only=False,
        )

        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        self.muril = AutoModel.from_pretrained(MODEL_NAME)
        self.muril.eval()
        for param in self.muril.parameters():
            param.requires_grad = False

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

        self.X_val = np.load(X_VAL_PATH)
        self.validation_df = pd.read_pickle(VALIDATION_PATH)

        import importlib.util

        spec = importlib.util.spec_from_file_location(
            "udyam_inference_pipeline", PIPELINE_PATH
        )
        module = importlib.util.module_from_spec(spec)
        sys.modules["udyam_inference_pipeline"] = module
        spec.loader.exec_module(module)

        module.tokenizer = self.tokenizer
        module.muril = self.muril
        module.loaded_sif_head = self.sif_head
        module.loaded_lsr_head = self.lsr_head
        module.loaded_barrier_failure_head = self.barrier_failure_head
        module.loaded_barrier_function_mlp = self.barrier_function_mlp

        self.pipeline = module

    def analyze_report(self, report_text: str):
        return self.pipeline.analyze_report(report_text)


def load_udyam_ai():
    system = UdyamAI()
    assert system.X_val.shape == (96, 768)
    assert system.validation_df.shape == (96, 40)
    return system
