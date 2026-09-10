const ML_SERVICE_URL =
    process.env.ML_SERVICE_URL ||
    "http://localhost:8000";

const ML_MODEL_VERSION =
    process.env.ML_MODEL_VERSION ||
    "FINAL_41_5Y_B";

const ML_MODEL_NAME =
    process.env.ML_MODEL_NAME ||
    "MuRIL";


const analyzeReportWithML = async (reportText) => {
    if (
        !reportText ||
        typeof reportText !== "string" ||
        !reportText.trim()
    ) {
        throw new Error(
            "Report text is required for ML analysis."
        );
    }

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            120000
        );

    try {
        const response = await fetch(
            `${ML_SERVICE_URL}/analyze-report`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    report_text:
                        reportText.trim(),
                }),

                signal:
                    controller.signal,
            }
        );

        const responseText =
            await response.text();

        let data;

        try {
            data =
                responseText
                    ? JSON.parse(responseText)
                    : {};
        } catch (_) {
            throw new Error(
                `ML service returned invalid JSON: ${responseText}`
            );
        }

        if (!response.ok) {
            throw new Error(
                data?.detail ||
                data?.message ||
                `ML service returned HTTP ${response.status}`
            );
        }

        return data;
    } catch (error) {
        if (
            error.name ===
            "AbortError"
        ) {
            throw new Error(
                "ML service request timed out."
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
};

// Get existing ML analysis for a report
const getMLResultByReportId = async (reportId) => {
    if (!reportId || typeof reportId !== "string") {
        throw new Error("Report ID is required.");
    }

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        30000
    );

    try {
        const response = await fetch(
            `${process.env.BACKEND_URL || "http://localhost:5000"}/api/ml/report/${encodeURIComponent(reportId.trim())}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                signal: controller.signal,
            }
        );

        const responseText = await response.text();

        let data;

        try {
            data = responseText
                ? JSON.parse(responseText)
                : {};
        } catch (_) {
            throw new Error(
                `Backend returned invalid JSON: ${responseText}`
            );
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                data?.detail ||
                `Backend returned HTTP ${response.status}`
            );
        }

        return data;
    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error(
                "ML result request timed out."
            );
        }

        throw error;
    } finally {
        clearTimeout(timeout);
    }
};


const normalizeBarrierFunction = (
    value
) => {
    if (!value) {
        return "NOT_STATED";
    }

    const normalized =
        String(value)
            .trim()
            .toLowerCase();

    const allowed = {
        prevention:
            "prevention",

        detection:
            "detection",

        control:
            "control",

        mitigation:
            "mitigation",
    };

    return (
        allowed[normalized] ||
        "NOT_STATED"
    );
};


const extractEvidencePhrases = (
    mlResult
) => {
    return (
        mlResult?.evidence?.matches
            ?.map(
                (item) =>
                    item?.matched_phrase
            )
            .filter(Boolean) ||
        []
    );
};


const extractLSRTags = (
    mlResult
) => {
    return (
        mlResult?.lsr?.predictions
            ?.map(
                (item) =>
                    item?.label
            )
            .filter(Boolean) ||
        []
    );
};


const buildMLResultData = (
    report,
    mlResult
) => {
    // ==============================
    // SIF
    // ==============================

    const sifPrediction =
        mlResult?.sif?.prediction ===
        "SIF Potential";

    const sifConfidence =
        Number(
            mlResult?.sif?.probability
        );


    // ==============================
    // BARRIER FAILURE
    // ==============================

    const barrierFailure =
        mlResult?.barrier_failure
            ?.prediction ||
        "NOT_STATED";

    const barrierFailureConfidence =
        Number(
            mlResult?.barrier_failure
                ?.confidence
        );


    // ==============================
    // BARRIER FUNCTION
    // ==============================

    const barrierFunction =
        normalizeBarrierFunction(
            mlResult
                ?.barrier_function
                ?.prediction
        );

    const barrierFunctionScore =
        Number(
            mlResult
                ?.barrier_function
                ?.raw_score
        );


    // ==============================
    // SBRI
    // ==============================

    const sbriScore =
        Number(
            mlResult?.sbri?.score
        );

    const sbri = {
        score:
            Number.isFinite(sbriScore)
                ? Math.min(
                    1,
                    Math.max(
                        0,
                        sbriScore / 100
                    )
                )
                : null,

        drivers: {
            severity:
                Number.isFinite(
                    Number(mlResult?.sbri?.sif_score)
                )
                    ? Math.min(
                        1,
                        Math.max(
                            0,
                            Number(mlResult.sbri.sif_score) / 100
                        )
                    )
                    : null,

            exposure:
                Number.isFinite(
                    Number(mlResult?.sbri?.precursor_score)
                )
                    ? Math.min(
                        1,
                        Math.max(
                            0,
                            Number(mlResult.sbri.precursor_score) / 100
                        )
                    )
                    : null,

            barrier_criticality:
                Number.isFinite(
                    Number(mlResult?.sbri?.barrier_score)
                )
                    ? Math.min(
                        1,
                        Math.max(
                            0,
                            Number(mlResult.sbri.barrier_score) / 100
                        )
                    )
                    : null,

            recurrence:
                Number.isFinite(
                    Number(mlResult?.sbri?.recurrence_score)
                )
                    ? Math.min(
                        1,
                        Math.max(
                            0,
                            Number(mlResult.sbri.recurrence_score) / 100
                        )
                    )
                    : null,

            trend:
                Number.isFinite(
                    Number(mlResult?.sbri?.cluster_score)
                )
                    ? Math.min(
                        1,
                        Math.max(
                            0,
                            Number(mlResult.sbri.cluster_score) / 100
                        )
                    )
                    : null,
        },
    };


    // ==============================
    // RETURN NORMALIZED RESULT
    // ==============================

    return {
        // --------------------------
        // REPORT REFERENCE
        // --------------------------

        report_id:
            report.report_id,


        // --------------------------
        // MODEL INFORMATION
        // --------------------------

        model_name:
            ML_MODEL_NAME,

        model_version:
            ML_MODEL_VERSION,


        // --------------------------
        // STRUCTURED SAFETY DATA
        // --------------------------

        // These remain sourced from
        // the original report because
        // they are record-keeping fields.

        activity:
            report.activity ||
            "NOT_STATED",

        location:
            report.location ||
            "NOT_STATED",

        equipment:
            report.equipment ||
            "NOT_STATED",

        language_style:
            report.language_style ||
            "NOT_STATED",

        hazard:
            report.hazard ||
            "NOT_STATED",

        energy_source:
            report.energy_source ||
            [],

        exposure:
            report.exposure ||
            "NOT_STATED",

        unsafe_act_condition:
            report.unsafe_act_condition ||
            "NOT_STATED",

        barrier_or_control:
            report.barrier_or_control ||
            "NOT_STATED",

        barrier_failure_mode:
            [
                "missing",
                "bypassed",
                "degraded",
                "unverified",
                "none",
            ].includes(
                barrierFailure
            )
                ? barrierFailure
                : "NOT_STATED",

        barrier_function:
            barrierFunction,

        potential_consequence:
            report.potential_consequence ||
            "NOT_STATED",

        actual_outcome:
            report.actual_outcome ||
            "NOT_STATED",


        // --------------------------
        // SIF INTELLIGENCE
        // --------------------------

        sif_potential:
            sifPrediction,

        sif_confidence:
            Number.isFinite(
                sifConfidence
            )
                ? Math.min(
                    1,
                    Math.max(
                        0,
                        sifConfidence
                    )
                )
                : 0,

        sif_level:
            "NOT_STATED",


        // --------------------------
        // LSR
        // --------------------------

        lsr_tags:
            extractLSRTags(
                mlResult
            ),


        // --------------------------
        // EVIDENCE
        // --------------------------

        evidence_phrases:
            extractEvidencePhrases(
                mlResult
            ),


        // --------------------------
        // TEMPORAL INTELLIGENCE
        // --------------------------

        cluster_id:
            null,

        recurrence_count:
            0,

        trend:
            "NOT_STATED",

        barrier_health:
            "NOT_STATED",


        // --------------------------
        // SBRI
        // --------------------------

        sbri_score:
            sbri.score,

        sbri_drivers:
            sbri.drivers,


        // --------------------------
        // EXTRA ML METADATA
        // --------------------------

        barrier_failure_confidence:
            Number.isFinite(
                barrierFailureConfidence
            )
                ? barrierFailureConfidence
                : null,

        barrier_function_score:
            Number.isFinite(
                barrierFunctionScore
            )
                ? barrierFunctionScore
                : null,

        lsr_evidence_grounded:
            mlResult?.lsr
                ?.evidence_grounded ||
            [],

        lsr_unsupported:
            mlResult?.lsr
                ?.unsupported ||
            [],

        canonical_precursors:
            mlResult
                ?.canonical_precursors ||
            null,

        consistency_gate:
            mlResult
                ?.consistency_gate ||
            null,
    };
};


module.exports = {
    analyzeReportWithML,
    buildMLResultData,
};