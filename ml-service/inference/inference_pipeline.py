"""
SIH26165 Udyam AI
Reusable End-to-End Inference Pipeline

Checkpoint:
FINAL_41_5Y_B

Main function:
    analyze_report(report_text)

Pipeline:
    Raw report
        -> MuRIL embedding
        -> SIF
        -> LSR
        -> Barrier Failure
        -> Barrier Function
        -> Deterministic Evidence
        -> Consistency Gate
        -> Canonical Normalization
        -> Canonical Precursor Vector
        -> SBRI
        -> Risk Band

IMPORTANT:
This module expects the following runtime objects to be
provided by the application/loader:

    tokenizer
    muril
    loaded_sif_head
    loaded_lsr_head
    loaded_barrier_failure_head
    loaded_barrier_function_mlp

and locked configuration constants.
"""

import torch
import numpy as np


    
def mean_pool(last_hidden_state, attention_mask):
    mask = (
        attention_mask
        .unsqueeze(-1)
        .expand(last_hidden_state.size())
        .float()
    )

    summed = torch.sum(
        last_hidden_state * mask,
        dim=1
    )

    counts = torch.clamp(
        mask.sum(dim=1),
        min=1e-9
    )

    return summed / counts


LSR_LABELS = ['Confined Spaces', 'Energy Isolation', 'Hot Work', 'Work Authorisation', 'Safe Mechanical Lifting', 'Line of Fire', 'Working at Height']

BARRIER_FAILURE_LABELS = ['none', 'missing', 'bypassed', 'degraded', 'unverified']

BARRIER_FUNCTION_LABELS = ['Prevention', 'Detection', 'Control', 'Mitigation']

CANONICAL_CONCEPTS = ['Energy_Isolation_Verification_Failure', 'Fall_Protection_Failure', 'Confined_Space_Entry_Control_Failure', 'Work_Authorisation_Failure', 'Mechanical_Lifting_Control_Failure', 'Line_of_Fire_Control_Failure']

EVIDENCE_RULES = {'Confined Spaces': ['confined space', 'gas testing was not completed', 'atmosphere was not verified as safe', 'entry controls'], 'Hot Work': ['hot work', 'fire watch', 'hot-work permit'], 'Energy Isolation': ['energy isolation', 'zero-energy', 'lockout', 'lockout/tagout', 'loto'], 'Work Authorisation': ['work authorisation', 'work authorization', 'permit'], 'Safe Mechanical Lifting': ['lifting', 'rigging', 'load', 'hoist', 'crane'], 'Line of Fire': ['line of fire', 'exclusion zone', 'movement control'], 'Working at Height': ['working at height', 'fall protection', 'lifeline', 'anchorage']}

NORMALIZATION_RULES = {'Confined_Space_Entry_Control_Failure': ['gas testing was not completed', 'atmosphere was not verified as safe', 'without confirmed entry controls'], 'Energy_Isolation_Verification_Failure': ['energy isolation', 'zero-energy', 'zero energy', 'lockout', 'lockout/tagout', 'loto'], 'Fall_Protection_Failure': ['not anchored', 'lifeline remained unconnected', 'fall-arrest', 'fall arrest', 'fall protection was not', 'fall path'], 'Work_Authorisation_Failure': ['work authorisation was not', 'work authorization was not'], 'Mechanical_Lifting_Control_Failure': ['without confirmed rigging verification', 'rigging verification was not confirmed', 'load became unstable', 'unsafe lifting operation'], 'Line_of_Fire_Control_Failure': ['required separation distance was not maintained', 'line of fire', 'exclusion zone', 'movement control']}

def analyze_report(report_text):
    """
    Complete fresh-report inference pipeline.

    Input:
        report_text (str)

    Output:
        dict containing model predictions, evidence,
        canonical precursor, consistency gate and SBRI.
    """

    import torch
    import numpy as np

    # --------------------------------------------------------
    # 1. TEXT VALIDATION
    # --------------------------------------------------------
    if not isinstance(report_text, str) or not report_text.strip():
        raise ValueError("report_text must be a non-empty string")

    text = report_text.strip()
    text_lower = text.lower()

    # --------------------------------------------------------
    # 2. MuRIL EMBEDDING
    # --------------------------------------------------------
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=True
    )

    with torch.no_grad():
        outputs = muril(**inputs)

    embedding = mean_pool(
        outputs.last_hidden_state,
        inputs["attention_mask"]
    )

    assert embedding.shape == (1, 768)

    # --------------------------------------------------------
    # 3. MODEL PREDICTIONS
    # --------------------------------------------------------
    with torch.no_grad():

        sif_out = loaded_sif_head(embedding)

        lsr_out = loaded_lsr_head(embedding)

        barrier_failure_out = (
            loaded_barrier_failure_head(embedding)
        )

        barrier_function_out = (
            loaded_barrier_function_mlp(embedding)
        )

    sif_probability = float(
        sif_out[0, 0]
    )

    sif_positive = bool(
        sif_probability >= 0.50
    )

    lsr_probabilities = (
        lsr_out[0].cpu().numpy()
    )

    barrier_failure_probabilities = (
        barrier_failure_out[0].cpu().numpy()
    )

    barrier_function_logits = (
        barrier_function_out[0].cpu().numpy()
    )

    # --------------------------------------------------------
    # 4. LSR
    # --------------------------------------------------------
    lsr_predictions = [
        label
        for label, prob in zip(
            LSR_LABELS,
            lsr_probabilities
        )
        if prob >= 0.50
    ]

    # --------------------------------------------------------
    # 5. BARRIER FAILURE
    # --------------------------------------------------------
    barrier_failure_index = int(
        np.argmax(barrier_failure_probabilities)
    )

    predicted_barrier_failure = (
        BARRIER_FAILURE_LABELS[
            barrier_failure_index
        ]
    )

    barrier_failure_confidence = float(
        barrier_failure_probabilities[
            barrier_failure_index
        ]
    )

    # --------------------------------------------------------
    # 6. BARRIER FUNCTION
    # --------------------------------------------------------
    barrier_function_index = int(
        np.argmax(barrier_function_logits)
    )

    predicted_barrier_function = (
        BARRIER_FUNCTION_LABELS[
            barrier_function_index
        ]
    )

    # --------------------------------------------------------
    # 7. DETERMINISTIC EVIDENCE
    # --------------------------------------------------------
    evidence_by_lsr = {}

    for lsr_label, phrases in EVIDENCE_RULES.items():

        matches = []

        for phrase in phrases:

            start = text_lower.find(phrase)

            if start != -1:
                matches.append({
                    "phrase": phrase,
                    "start_char": start,
                    "end_char": start + len(phrase)
                })

        if matches:
            evidence_by_lsr[lsr_label] = matches

    evidence_grounded_lsr = [
        label
        for label in LSR_LABELS
        if label in evidence_by_lsr
    ]

    # --------------------------------------------------------
    # 8. UNSUPPORTED LSR
    # --------------------------------------------------------
    unsupported_lsr = [
        label
        for label in lsr_predictions
        if label not in evidence_grounded_lsr
    ]

    # --------------------------------------------------------
    # 9. SIF EVIDENCE
    # --------------------------------------------------------
    sif_evidence_phrases = [
        "confined space",
        "gas testing was not completed",
        "atmosphere was not verified as safe",
        "without confirmed entry controls",
        "fall protection was not",
        "not anchored",
        "lifeline remained unconnected",
        "energy isolation",
        "zero-energy",
        "line of fire",
        "rigging verification"
    ]

    sif_evidence_found = any(
        phrase in text_lower
        for phrase in sif_evidence_phrases
    )

    # --------------------------------------------------------
    # 10. CONSISTENCY GATE
    # --------------------------------------------------------
    flags = []

    if unsupported_lsr:
        flags.append("LSR_WITHOUT_EVIDENCE")

    if sif_positive and not sif_evidence_found:
        flags.append("SIF_WITHOUT_EVIDENCE")

    barrier_evidence_failure = any(
        phrase in text_lower
        for phrase in [
            "was not completed",
            "was not verified",
            "without confirmed",
            "not anchored",
            "not maintained",
            "was bypassed",
            "was degraded"
        ]
    )

    if (
        barrier_evidence_failure
        and predicted_barrier_failure == "none"
    ):
        flags.append("BARRIER_MISMATCH")

    if len(flags) == 0:
        gate_outcome = "PASS"

    elif "SIF_WITHOUT_EVIDENCE" in flags:
        gate_outcome = "REVIEW"

    else:
        gate_outcome = "LOWER_CONFIDENCE"

    # --------------------------------------------------------
    # 11. CANONICAL NORMALIZATION
    # --------------------------------------------------------
    normalized_evidence = []

    for canonical_concept, phrases in (
        NORMALIZATION_RULES.items()
    ):

        for phrase in phrases:

            start = text_lower.find(phrase)

            if start != -1:
                normalized_evidence.append({
                    "canonical_concept":
                        canonical_concept,
                    "matched_phrase":
                        phrase,
                    "start_char":
                        start,
                    "end_char":
                        start + len(phrase),
                    "rule_type":
                        "normalization_phrase_match"
                })

    canonical_concepts_found = sorted({
        item["canonical_concept"]
        for item in normalized_evidence
    })

    # --------------------------------------------------------
    # 12. FRESH CANONICAL VECTOR
    # --------------------------------------------------------
    fresh_precursor_vector = np.zeros(
        6,
        dtype=np.float32
    )

    for concept in canonical_concepts_found:

        if concept in CANONICAL_CONCEPTS:

            idx = CANONICAL_CONCEPTS.index(
                concept
            )

            fresh_precursor_vector[idx] = 1.0

    active_precursors = [
        concept
        for concept, value in zip(
            CANONICAL_CONCEPTS,
            fresh_precursor_vector
        )
        if value == 1.0
    ]

    precursor_count = int(
        fresh_precursor_vector.sum()
    )

    # --------------------------------------------------------
    # 13. SBRI
    # --------------------------------------------------------
    precursor_score = (
        50 if precursor_count >= 2
        else 40 if precursor_count == 1
        else 0
    )

    barrier_score = (
        20
        if predicted_barrier_failure
        in {
            "missing",
            "bypassed",
            "degraded",
            "unverified"
        }
        else 0
    )

    sif_score = (
        20
        if sif_positive
        else 0
    )

    # No recurrence / cluster assignment for a new isolated report
    recurrence_score = 0
    cluster_score = 0

    sbri = min(
        100,
        precursor_score
        + barrier_score
        + sif_score
        + recurrence_score
        + cluster_score
    )

    if sbri <= 19:
        risk_band = "Low"
    elif sbri <= 39:
        risk_band = "Moderate"
    elif sbri <= 69:
        risk_band = "High"
    else:
        risk_band = "Critical"

    # --------------------------------------------------------
    # 14. FINAL RESULT
    # --------------------------------------------------------
    return {
        "report_text": text,

        "sif": {
            "probability": sif_probability,
            "prediction": (
                "SIF Potential"
                if sif_positive
                else "No SIF Potential"
            )
        },

        "lsr": {
            "predictions": [
                {
                    "label": label,
                    "probability": float(
                        lsr_probabilities[
                            LSR_LABELS.index(label)
                        ]
                    )
                }
                for label in lsr_predictions
            ],
            "evidence_grounded":
                evidence_grounded_lsr,
            "unsupported":
                unsupported_lsr
        },

        "barrier_failure": {
            "prediction":
                predicted_barrier_failure,
            "confidence":
                barrier_failure_confidence
        },

        "barrier_function": {
            "prediction":
                predicted_barrier_function,
            "raw_score":
                float(
                    barrier_function_logits[
                        barrier_function_index
                    ]
                )
        },

        "evidence": {
            "matches":
                normalized_evidence,
            "grounded_lsr":
                evidence_grounded_lsr
        },

        "canonical_precursors": {
            "concepts":
                active_precursors,
            "vector":
                fresh_precursor_vector.astype(int).tolist()
        },

        "consistency_gate": {
            "flags": flags,
            "outcome": gate_outcome
        },

        "sbri": {
            "score": int(sbri),
            "risk_band": risk_band,
            "precursor_score": precursor_score,
            "barrier_score": barrier_score,
            "sif_score": sif_score,
            "recurrence_score": recurrence_score,
            "cluster_score": cluster_score
        }
    }

