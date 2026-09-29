import { useEffect, useMemo, useState } from "react";

import { getMLResultByReportId } from "../api/ml.api";


/* =========================================================
   HELPERS
========================================================= */

const isSpecified = (value) => {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === "string") {
        const normalized =
            value.trim().toLowerCase();

        const emptyValues = new Set([
            "",
            "-",
            "—",
            "none",
            "null",
            "n/a",
            "na",
            "not stated",
            "not specified",
            "not provided",
            "not available",
            "unspecified",
            "unknown",
            "nil",
        ]);

        return !emptyValues.has(normalized);
    }

    if (Array.isArray(value)) {
        return value.some(isSpecified);
    }

    if (typeof value === "object") {
        return Object.values(value).some(
            isSpecified
        );
    }

    return true;
};


const formatLabel = (value) => {
    if (!isSpecified(value)) {
        return "";
    }

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
};


const formatPercent = (value) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return null;
    }

    const numeric =
        Number(value) <= 1
            ? Number(value) * 100
            : Number(value);

    return Math.round(
        Math.max(0, Math.min(100, numeric))
    );
};


const getSifScore = (report, mlResult) => {
    if (
        report?.sif_score !== null &&
        report?.sif_score !== undefined
    ) {
        return Number(report.sif_score);
    }

    if (
        mlResult?.sif_score !== null &&
        mlResult?.sif_score !== undefined
    ) {
        return Number(mlResult.sif_score);
    }

    return null;
};


const getSifPotential = (report, mlResult) => {
    if (
        typeof mlResult?.sif_potential ===
        "boolean"
    ) {
        return mlResult.sif_potential;
    }

    if (
        typeof report?.sif_potential ===
        "boolean"
    ) {
        return report.sif_potential;
    }

    return null;
};


const getSifLevel = (report, mlResult) => {
    if (isSpecified(mlResult?.sif_level)) {
        return mlResult.sif_level;
    }

    if (isSpecified(report?.sif_level)) {
        return report.sif_level;
    }

    return null;
};


const getLsrs = (report, mlResult) => {
    if (
        Array.isArray(mlResult?.lsr_tags) &&
        mlResult.lsr_tags.length > 0
    ) {
        return mlResult.lsr_tags;
    }

    if (
        Array.isArray(report?.lsr_tags) &&
        report.lsr_tags.length > 0
    ) {
        return report.lsr_tags;
    }

    return [];
};


const getEvidence = (report, mlResult) => {
    if (
        Array.isArray(
            mlResult?.evidence_phrases
        ) &&
        mlResult.evidence_phrases.length > 0
    ) {
        return mlResult.evidence_phrases;
    }

    if (
        Array.isArray(
            report?.evidence_phrases
        ) &&
        report.evidence_phrases.length > 0
    ) {
        return report.evidence_phrases;
    }

    return [];
};


const getBarrierFailure = (
    report,
    mlResult
) => {
    if (
        isSpecified(
            mlResult?.barrier_failure_mode
        )
    ) {
        return mlResult.barrier_failure_mode;
    }

    if (
        isSpecified(
            report?.barrier_failure_mode
        )
    ) {
        return report.barrier_failure_mode;
    }

    return null;
};


const getBarrierFunction = (
    report,
    mlResult
) => {
    if (
        isSpecified(
            mlResult?.barrier_function
        )
    ) {
        return mlResult.barrier_function;
    }

    if (
        isSpecified(
            report?.barrier_function
        )
    ) {
        return report.barrier_function;
    }

    return null;
};


/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const Section = ({
    title,
    eyebrow,
    children,
}) => {
    return (
        <section className="border-t border-[#e5ebe7] pt-5 mt-5">
            <div className="mb-3">
                {eyebrow && (
                    <p className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-[#718078]">
                        {eyebrow}
                    </p>
                )}

                <h3 className="mt-1 text-sm font-extrabold tracking-[0.04em] text-[#17211b]">
                    {title}
                </h3>
            </div>

            {children}
        </section>
    );
};


const Chip = ({
    children,
    tone = "default",
}) => {
    const toneClasses = {
        default:
            "bg-[#f2f6f3] text-[#33423a] border-[#dce5df]",

        green:
            "bg-[#eaf5ee] text-[#087542] border-[#cce6d7]",

        amber:
            "bg-[#fff7e8] text-[#996300] border-[#f1dfb5]",

        red:
            "bg-[#fff0f0] text-[#a33a3a] border-[#eccaca]",

        blue:
            "bg-[#eef5fb] text-[#245d88] border-[#d5e5f2]",
    };

    return (
        <span
            className={`
                inline-flex
                items-center
                px-2.5
                py-1
                rounded-full
                border
                text-[10px]
                font-bold
                ${toneClasses[tone] ||
                toneClasses.default}
            `}
        >
            {children}
        </span>
    );
};


const MetricCard = ({
    label,
    value,
    subtext,
    tone = "default",
}) => {
    const toneClasses = {
        default:
            "border-[#d9e2dc] bg-white",

        green:
            "border-[#cce6d7] bg-[#f6fbf8]",

        amber:
            "border-[#f0dfb9] bg-[#fffaf0]",

        red:
            "border-[#eccaca] bg-[#fff7f7]",
    };

    return (
        <div
            className={`
                rounded-[6px]
                border
                p-4
                ${toneClasses[tone] ||
                toneClasses.default}
            `}
        >
            <p className="text-[9px] font-extrabold tracking-[0.12em] uppercase text-[#718078]">
                {label}
            </p>

            <p className="mt-2 text-xl font-extrabold text-[#17211b]">
                {value}
            </p>

            {subtext && (
                <p className="mt-1 text-[10px] text-[#718078]">
                    {subtext}
                </p>
            )}
        </div>
    );
};


const DriverBar = ({
    label,
    value,
}) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return null;
    }

    const percentage =
        Math.round(
            Math.max(
                0,
                Math.min(
                    100,
                    Number(value) * 100
                )
            )
        );

    return (
        <div className="mb-3 last:mb-0">
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-[#536159]">
                    {formatLabel(label)}
                </span>

                <span className="text-[10px] font-bold text-[#33423a]">
                    {percentage}%
                </span>
            </div>

            <div className="h-1.5 bg-[#edf2ee] rounded-full overflow-hidden">
                <div
                    className="h-full bg-[#087542] rounded-full transition-all"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

const AISafetyIntelligence = ({
    report,
    reportId,
    compact = false,
}) => {

    const resolvedReportId =
        reportId ||
        report?.report_id;

    const [mlResult, setMLResult] =
        useState(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    /* =====================================================
       LOAD ML RESULT
    ===================================================== */

    useEffect(() => {

        let cancelled = false;

        const loadMLResult = async () => {

            if (!resolvedReportId) {
                return;
            }

            try {

                setLoading(true);
                setError("");

                const response =
                    await getMLResultByReportId(
                        resolvedReportId
                    );

                if (!cancelled) {

                    setMLResult(
                        response?.data || null
                    );

                }

            } catch (err) {

                /*
                 * ML result may legitimately not
                 * exist for older reports.
                 *
                 * Do not break the existing
                 * report UI in that situation.
                 */

                if (!cancelled) {

                    setMLResult(null);

                    if (
                        err?.response?.status !==
                        404
                    ) {
                        setError(
                            "AI safety analysis could not be loaded."
                        );
                    }
                }

            } finally {

                if (!cancelled) {
                    setLoading(false);
                }

            }
        };


        loadMLResult();


        return () => {
            cancelled = true;
        };

    }, [resolvedReportId]);


    /* =====================================================
       DERIVED VALUES
    ===================================================== */

    const sifPotential =
        useMemo(
            () =>
                getSifPotential(
                    report,
                    mlResult
                ),
            [report, mlResult]
        );


    const sifLevel =
        useMemo(
            () =>
                getSifLevel(
                    report,
                    mlResult
                ),
            [report, mlResult]
        );


    const sifScore =
        useMemo(
            () =>
                getSifScore(
                    report,
                    mlResult
                ),
            [report, mlResult]
        );


    const sifConfidence =
        formatPercent(
            mlResult?.sif_confidence
        );


    const lsrTags =
        useMemo(
            () =>
                getLsrs(
                    report,
                    mlResult
                ),
            [report, mlResult]
        );


    const evidencePhrases =
        useMemo(
            () =>
                getEvidence(
                    report,
                    mlResult
                ),
            [report, mlResult]
        );


    const barrierFailure =
        getBarrierFailure(
            report,
            mlResult
        );


    const barrierFunction =
        getBarrierFunction(
            report,
            mlResult
        );


    const sbri =
        formatPercent(
            mlResult?.sbri_score
        );


    const sbriDrivers =
        mlResult?.sbri_drivers ||
        {};


    const canonicalConcepts =
        Array.isArray(
            mlResult?.canonical_precursors
                ?.concepts
        )
            ? mlResult
                .canonical_precursors
                .concepts
            : [];


    const consistencyFlags =
        Array.isArray(
            mlResult?.consistency_gate
                ?.flags
        )
            ? mlResult
                .consistency_gate
                .flags
            : [];


    const consistencyOutcome =
        mlResult?.consistency_gate
            ?.outcome;


    const evidenceGrounded =
        Array.isArray(
            mlResult?.lsr_evidence_grounded
        )
            ? mlResult.lsr_evidence_grounded
            : [];


    const unsupportedLSRs =
        Array.isArray(
            mlResult?.lsr_unsupported
        )
            ? mlResult.lsr_unsupported
            : [];


    const hasRecurrence =
        Number(
            mlResult?.recurrence_count
        ) > 0;


    const hasTrend =
        isSpecified(
            mlResult?.trend
        );


    const hasBarrierHealth =
        isSpecified(
            mlResult?.barrier_health
        );


    const hasSBRI =
        sbri !== null;


    const hasExplainability =
        evidencePhrases.length > 0 ||
        lsrTags.length > 0 ||
        canonicalConcepts.length > 0 ||
        consistencyFlags.length > 0;


    const hasBarrier =
        isSpecified(barrierFailure) ||
        isSpecified(barrierFunction) ||
        isSpecified(
            mlResult?.barrier_or_control
        );


    const hasTemporalIntelligence =
        hasRecurrence ||
        hasTrend ||
        hasBarrierHealth ||
        isSpecified(
            mlResult?.cluster_id
        );


    const hasReview =
        isSpecified(
            mlResult?.review_status
        );


    /* =====================================================
       LOADING STATE
    ===================================================== */

    if (loading && !mlResult) {

        return (
            <section
                className="
                    bg-white
                    border
                    border-[#d9e2dc]
                    rounded-[6px]
                    p-6
                "
            >

                <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded-full bg-[#eaf4ee] flex items-center justify-center">
                        <span className="text-[#087542] text-sm">
                            AI
                        </span>
                    </div>

                    <div>

                        <p className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-[#087542]">
                            SAFETY INTELLIGENCE
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#33423a]">
                            Loading AI analysis...
                        </p>

                    </div>

                </div>

            </section>
        );
    }


    /* =====================================================
       NO ML RESULT
    ===================================================== */

    if (!mlResult && !sifPotential && !sifLevel) {

        return (
            <section
                className="
                    bg-white
                    border
                    border-[#d9e2dc]
                    rounded-[6px]
                    p-6
                "
            >

                <div className="flex items-start gap-4">

                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#f1f4f2] flex items-center justify-center text-[10px] font-extrabold text-[#718078]">
                        AI
                    </div>

                    <div className="min-w-0">

                        <p className="text-[9px] font-extrabold tracking-[0.15em] uppercase text-[#718078]">
                            SAFETY INTELLIGENCE
                        </p>

                        <h3 className="mt-1 text-sm font-extrabold text-[#17211b]">
                            AI analysis unavailable
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-[#718078]">
                            {error ||
                                "No stored AI analysis is available for this report yet."}
                        </p>

                    </div>

                </div>

            </section>
        );
    }


    /* =====================================================
       MAIN UI
    ===================================================== */

    return (

        <section
            className="
                bg-white
                border
                border-[#d9e2dc]
                rounded-[6px]
                overflow-hidden
            "
        >

            {/* =================================================
               HEADER
            ================================================= */}

            <div
                className="
                    px-6
                    py-5
                    border-b
                    border-[#e5ebe7]
                    bg-[#fbfdfb]
                "
            >

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div className="flex items-start gap-3">

                        <div className="w-9 h-9 shrink-0 rounded-full bg-[#eaf4ee] flex items-center justify-center">
                            <span className="text-[#087542] text-[10px] font-extrabold">
                                AI
                            </span>
                        </div>

                        <div>

                            <p className="text-[9px] font-extrabold tracking-[0.16em] uppercase text-[#087542]">
                                AI-POWERED
                            </p>

                            <h2 className="mt-1 text-base font-extrabold text-[#17211b]">
                                Safety Intelligence
                            </h2>

                            <p className="mt-1 text-[11px] text-[#718078]">
                                Model-assisted safety analysis of this report.
                            </p>

                        </div>

                    </div>


                    {/* MODEL BADGE */}

                    <div className="flex flex-wrap items-center gap-2">

                        {isSpecified(
                            mlResult?.model_name
                        ) && (
                            <Chip tone="blue">
                                {mlResult.model_name}
                            </Chip>
                        )}

                        {isSpecified(
                            mlResult?.model_version
                        ) && (
                            <Chip>
                                {mlResult.model_version}
                            </Chip>
                        )}

                        {hasReview && (
                            <Chip
                                tone={
                                    mlResult.review_status ===
                                    "corrected"
                                        ? "amber"
                                        : mlResult.review_status ===
                                            "reviewed"
                                            ? "green"
                                            : "default"
                                }
                            >
                                {formatLabel(
                                    mlResult.review_status
                                )}
                            </Chip>
                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
               CONTENT
            ================================================= */}

            <div className="p-6">

                {/* =================================================
                   CORE SAFETY METRICS
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        gap-3
                    "
                >

                    <MetricCard
                        label="SIF Potential"
                        value={
                            sifPotential === null
                                ? "—"
                                : sifPotential
                                    ? "Potential"
                                    : "Not Potential"
                        }
                        subtext={
                            sifConfidence !== null
                                ? `${sifConfidence}% model confidence`
                                : "Model classification"
                        }
                        tone={
                            sifPotential === true
                                ? "red"
                                : sifPotential === false
                                    ? "green"
                                    : "default"
                        }
                    />


                    <MetricCard
                        label="SIF Score"
                        value={
                            sifScore === null
                                ? "—"
                                : `${Math.round(
                                    Math.max(
                                        0,
                                        Math.min(
                                            100,
                                            sifScore
                                        )
                                    )
                                )}/100`
                        }
                        subtext={
                            isSpecified(sifLevel)
                                ? `Level: ${formatLabel(
                                    sifLevel
                                )}`
                                : "Safety significance score"
                        }
                        tone={
                            sifScore !== null &&
                                sifScore >= 70
                                ? "red"
                                : sifScore !== null &&
                                    sifScore >= 40
                                    ? "amber"
                                    : "default"
                        }
                    />


                    <MetricCard
                        label="SBRI"
                        value={
                            hasSBRI
                                ? `${sbri}/100`
                                : "—"
                        }
                        subtext="Safety Burden & Risk Indicator"
                        tone={
                            sbri !== null &&
                                sbri >= 70
                                ? "red"
                                : sbri !== null &&
                                    sbri >= 40
                                    ? "amber"
                                    : "default"
                        }
                    />

                </div>


                {/* =================================================
                   LIFE-SAVING RULES
                ================================================= */}

                {lsrTags.length > 0 && (

                    <Section
                        eyebrow="IOGP SAFETY"
                        title="Life-Saving Rules"
                    >

                        <div className="flex flex-wrap gap-2">

                            {lsrTags.map(
                                (tag, index) => (
                                    <Chip
                                        key={`${tag}-${index}`}
                                        tone="green"
                                    >
                                        {tag}
                                    </Chip>
                                )
                            )}

                        </div>


                        {evidenceGrounded.length >
                            0 && (

                            <div className="mt-4">

                                <p className="text-[9px] font-extrabold tracking-[0.1em] uppercase text-[#718078] mb-2">
                                    Evidence-grounded rules
                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {evidenceGrounded.map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <Chip
                                                key={`${index}`}
                                                tone="blue"
                                            >
                                                {typeof item ===
                                                "string"
                                                    ? item
                                                    : item?.label ||
                                                    item?.name ||
                                                    JSON.stringify(
                                                        item
                                                    )}
                                            </Chip>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {unsupportedLSRs.length >
                            0 && (

                            <div className="mt-4">

                                <p className="text-[9px] font-extrabold tracking-[0.1em] uppercase text-[#996300] mb-2">
                                    Unsupported classifications
                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {unsupportedLSRs.map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <Chip
                                                key={`${index}`}
                                                tone="amber"
                                            >
                                                {typeof item ===
                                                "string"
                                                    ? item
                                                    : item?.label ||
                                                    item?.name ||
                                                    JSON.stringify(
                                                        item
                                                    )}
                                            </Chip>

                                        )
                                    )}

                                </div>

                            </div>

                        )}

                    </Section>

                )}


                {/* =================================================
                   EVIDENCE / EXPLAINABILITY
                ================================================= */}

                {hasExplainability && (

                    <Section
                        eyebrow="MODEL EXPLAINABILITY"
                        title="Why this report was flagged"
                    >

                        {evidencePhrases.length >
                            0 && (

                            <div>

                                <p className="text-[9px] font-extrabold tracking-[0.1em] uppercase text-[#718078] mb-2">
                                    Evidence detected in report
                                </p>

                                <div className="space-y-2">

                                    {evidencePhrases.map(
                                        (
                                            phrase,
                                            index
                                        ) => (

                                            <div
                                                key={`${phrase}-${index}`}
                                                className="
                                                    flex
                                                    items-center
                                                    gap-3
                                                    px-3
                                                    py-2.5
                                                    rounded-[5px]
                                                    bg-[#f7faf8]
                                                    border
                                                    border-[#e1e9e3]
                                                "
                                            >

                                                <span className="w-5 h-5 shrink-0 rounded-full bg-[#eaf4ee] text-[#087542] flex items-center justify-center text-[9px] font-extrabold">
                                                    ✓
                                                </span>

                                                <span className="text-xs font-semibold text-[#33423a]">
                                                    "{phrase}"
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {canonicalConcepts.length >
                            0 && (

                            <div className="mt-4">

                                <p className="text-[9px] font-extrabold tracking-[0.1em] uppercase text-[#718078] mb-2">
                                    Canonical precursor concepts
                                </p>

                                <div className="flex flex-wrap gap-2">

                                    {canonicalConcepts.map(
                                        (
                                            concept,
                                            index
                                        ) => (

                                            <Chip
                                                key={`${concept}-${index}`}
                                            >
                                                {concept}
                                            </Chip>

                                        )
                                    )}

                                </div>

                            </div>

                        )}


                        {consistencyOutcome &&
                            isSpecified(
                                consistencyOutcome
                            ) && (

                                <div className="mt-4">

                                    <div className="flex items-center justify-between gap-3">

                                        <p className="text-[9px] font-extrabold tracking-[0.1em] uppercase text-[#718078]">
                                            Consistency gate
                                        </p>

                                        <Chip
                                            tone={
                                                consistencyFlags.length >
                                                    0
                                                    ? "amber"
                                                    : "green"
                                            }
                                        >
                                            {formatLabel(
                                                consistencyOutcome
                                            )}
                                        </Chip>

                                    </div>


                                    {consistencyFlags.length >
                                        0 && (

                                        <div className="mt-2 space-y-1">

                                            {consistencyFlags.map(
                                                (
                                                    flag,
                                                    index
                                                ) => (

                                                    <p
                                                        key={`${flag}-${index}`}
                                                        className="text-xs text-[#6d6251]"
                                                    >
                                                        •{" "}
                                                        {flag}
                                                    </p>

                                                )
                                            )}

                                        </div>

                                    )}

                                </div>

                            )}

                    </Section>

                )}


                {/* =================================================
                   BARRIER INTELLIGENCE
                ================================================= */}

                {hasBarrier && (

                    <Section
                        eyebrow="CONTROL ANALYSIS"
                        title="Barrier Intelligence"
                    >

                        <div
                            className="
                                grid
                                grid-cols-1
                                md:grid-cols-3
                                gap-3
                            "
                        >

                            {isSpecified(
                                mlResult?.barrier_or_control
                            ) && (

                                <div className="p-3 rounded-[5px] bg-[#f7faf8] border border-[#e1e9e3]">

                                    <p className="text-[9px] font-extrabold tracking-[0.08em] uppercase text-[#718078]">
                                        Barrier / Control
                                    </p>

                                    <p className="mt-2 text-xs font-semibold leading-5 text-[#33423a]">
                                        {formatLabel(
                                            mlResult.barrier_or_control
                                        )}
                                    </p>

                                </div>

                            )}


                            {isSpecified(
                                barrierFailure
                            ) && (

                                <div className="p-3 rounded-[5px] bg-[#f7faf8] border border-[#e1e9e3]">

                                    <p className="text-[9px] font-extrabold tracking-[0.08em] uppercase text-[#718078]">
                                        Failure Mode
                                    </p>

                                    <p className="mt-2 text-xs font-semibold leading-5 text-[#33423a]">
                                        {formatLabel(
                                            barrierFailure
                                        )}
                                    </p>

                                </div>

                            )}


                            {isSpecified(
                                barrierFunction
                            ) && (

                                <div className="p-3 rounded-[5px] bg-[#f7faf8] border border-[#e1e9e3]">

                                    <p className="text-[9px] font-extrabold tracking-[0.08em] uppercase text-[#718078]">
                                        Barrier Function
                                    </p>

                                    <p className="mt-2 text-xs font-semibold leading-5 text-[#33423a]">
                                        {formatLabel(
                                            barrierFunction
                                        )}
                                    </p>

                                </div>

                            )}

                        </div>


                        {isSpecified(
                            mlResult?.potential_consequence
                        ) && (

                            <div className="mt-3 p-4 rounded-[5px] border border-[#e5ebe7] bg-white">

                                <p className="text-[9px] font-extrabold tracking-[0.08em] uppercase text-[#718078]">
                                    Potential Consequence
                                </p>

                                <p className="mt-2 text-xs leading-5 text-[#33423a]">
                                    {mlResult.potential_consequence}
                                </p>

                            </div>

                        )}

                    </Section>

                )}


                {/* =================================================
                   SBRI DRIVERS
                ================================================= */}

                {hasSBRI && (

                    <Section
                        eyebrow="RISK COMPOSITION"
                        title="SBRI Drivers"
                    >

                        <div
                            className="
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                gap-x-6
                                gap-y-2
                            "
                        >

                            <DriverBar
                                label="Severity"
                                value={
                                    sbriDrivers.severity
                                }
                            />

                            <DriverBar
                                label="Exposure"
                                value={
                                    sbriDrivers.exposure
                                }
                            />

                            <DriverBar
                                label="Barrier Criticality"
                                value={
                                    sbriDrivers
                                        .barrier_criticality
                                }
                            />

                            <DriverBar
                                label="Recurrence"
                                value={
                                    sbriDrivers.recurrence
                                }
                            />

                            <DriverBar
                                label="Trend"
                                value={
                                    sbriDrivers.trend
                                }
                            />

                        </div>

                    </Section>

                )}


                {/* =================================================
                   TEMPORAL / RECURRENCE INTELLIGENCE
                ================================================= */}

                {hasTemporalIntelligence && (

                    <Section
                        eyebrow="LONGITUDINAL INTELLIGENCE"
                        title="Recurring Precursor Signal"
                    >

                        <div
                            className="
                                grid
                                grid-cols-2
                                md:grid-cols-4
                                gap-3
                            "
                        >

                            {isSpecified(
                                mlResult?.cluster_id
                            ) && (

                                <MetricCard
                                    label="Cluster"
                                    value={
                                        mlResult.cluster_id
                                    }
                                    subtext="Precursor group"
                                />

                            )}


                            {hasRecurrence && (

                                <MetricCard
                                    label="Recurrence"
                                    value={
                                        mlResult.recurrence_count
                                    }
                                    subtext="Related occurrences"
                                    tone={
                                        mlResult
                                            .recurrence_count >=
                                            5
                                            ? "amber"
                                            : "default"
                                    }
                                />

                            )}


                            {hasTrend && (

                                <MetricCard
                                    label="Trend"
                                    value={
                                        formatLabel(
                                            mlResult.trend
                                        )
                                    }
                                    subtext="Observed pattern"
                                    tone={
                                        mlResult.trend ===
                                        "increasing"
                                            ? "amber"
                                            : mlResult.trend ===
                                                "decreasing"
                                                ? "green"
                                                : "default"
                                    }
                                />

                            )}


                            {hasBarrierHealth && (

                                <MetricCard
                                    label="Barrier Health"
                                    value={
                                        formatLabel(
                                            mlResult.barrier_health
                                        )
                                    }
                                    subtext="Current barrier condition"
                                    tone={
                                        mlResult.barrier_health ===
                                        "critical"
                                            ? "red"
                                            : mlResult
                                                .barrier_health ===
                                                "degrading"
                                                ? "amber"
                                                : "green"
                                    }
                                />

                            )}

                        </div>

                    </Section>

                )}


                {/* =================================================
                   COMPACT MODE NOTE
                ================================================= */}

                {compact && (
                    <div className="mt-5 pt-4 border-t border-[#e5ebe7]">

                        <p className="text-[10px] text-[#718078]">
                            AI analysis is advisory and should be reviewed alongside the original safety report.
                        </p>

                    </div>
                )}

            </div>

        </section>
    );
};


export default AISafetyIntelligence;