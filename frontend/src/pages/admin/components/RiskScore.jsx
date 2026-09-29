import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/*
    Risk Score / SBRI — explainability view

    This page intentionally does NOT expose editable sliders.

    The current prototype weighting is:
        Severity             25%
        Exposure             20%
        Barrier Criticality  25%
        Recurrence           15%
        Trend                15%

    The purpose of this screen is to explain how the stored SBRI
    priority score should be interpreted, rather than pretending that
    frontend sliders modify the ML model or persisted MLResult.
*/

const CURRENT_WEIGHTS = [
    {
        key: "severity",
        label: "Severity",
        weight: 25,
        description:
            "Potential seriousness of the consequence associated with the precursor.",
    },
    {
        key: "exposure",
        label: "Exposure",
        weight: 20,
        description:
            "Degree of worker or operational exposure represented by the precursor.",
    },
    {
        key: "barrier_criticality",
        label: "Barrier Criticality",
        weight: 25,
        description:
            "Importance of the affected safety barrier in preventing the unwanted outcome.",
    },
    {
        key: "recurrence",
        label: "Recurrence",
        weight: 15,
        description:
            "How repeatedly the same precursor pattern appears across reports.",
    },
    {
        key: "trend",
        label: "Trend",
        weight: 15,
        description:
            "The stored direction of recent precursor activity.",
    },
];

const formatScore = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    return number.toFixed(2);
};

const getPriorityLabel = (score) => {
    const value = Number(score);

    if (!Number.isFinite(value)) {
        return {
            label: "Not available",
            className: "bg-[#f1f4f2] text-[#66736b]",
        };
    }

    if (value >= 0.75) {
        return {
            label: "High priority",
            className: "bg-[#fff0f0] text-[#c62828]",
        };
    }

    if (value >= 0.50) {
        return {
            label: "Medium priority",
            className: "bg-[#fff7e8] text-[#a15c00]",
        };
    }

    return {
        label: "Lower priority",
        className: "bg-[#edf8f1] text-[#087542]",
    };
};

function RiskScore() {
    const [weightsOpen, setWeightsOpen] = useState(false);
    const [clusters, setClusters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadScores = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_BASE_URL}/ml/clusters`
                );

                const payload = await response.json();

                if (!response.ok || !payload?.success) {
                    throw new Error(
                        payload?.message ||
                            "Unable to load current risk priorities."
                    );
                }

                if (!cancelled) {
                    setClusters(payload?.data || []);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Risk score loading error:", err);
                    setError(
                        err?.message ||
                            "Unable to load current risk priorities."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadScores();

        return () => {
            cancelled = true;
        };
    }, []);

    const scoreSummary = useMemo(() => {
        const scores = clusters
            .map((cluster) => Number(cluster.sbri_score))
            .filter((score) => Number.isFinite(score));

        if (!scores.length) {
            return {
                count: clusters.length,
                average: null,
                highest: null,
            };
        }

        return {
            count: clusters.length,
            average:
                scores.reduce((sum, score) => sum + score, 0) /
                scores.length,
            highest: Math.max(...scores),
        };
    }, [clusters]);

    return (
        <div>
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-[#17211b] text-[18px] font-extrabold">
                            Risk Score
                        </h2>

                        <span className="px-2.5 py-1 rounded-full bg-[#eaf4ee] text-[#087542] text-[8px] font-extrabold tracking-[0.08em]">
                            SBRI
                        </span>
                    </div>

                    <p className="mt-1 max-w-[680px] text-[#8a958e] text-[11px] leading-[1.6]">
                        Understand how recurring safety patterns are
                        prioritised and what the score represents.
                    </p>
                </div>
            </div>

            {/* How to read */}
            <section className="p-6 rounded-[6px] border border-[#d9e2dc] bg-white shadow-[0_8px_25px_rgba(20,50,35,0.045)]">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="max-w-[610px]">
                        <div className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                            HOW TO READ THE SCORE
                        </div>

                        <h3 className="mt-2 text-[#17211b] text-[17px] font-extrabold">
                            Higher score = higher priority
                        </h3>

                        <p className="mt-2 text-[#718078] text-[10px] leading-[1.7]">
                            The SBRI priority score helps safety teams compare
                            recurring precursor patterns using the current
                            risk factors. It is a prioritisation aid, not a
                            replacement for human safety review.
                        </p>
                    </div>
                </div>
            </section>

            {/* Current score snapshot */}
            <section className="mt-5">
                <div className="mb-3">
                    <div className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                        CURRENT INTELLIGENCE SNAPSHOT
                    </div>

                    <p className="mt-1 text-[#8a958e] text-[10px]">
                        Values below reflect the current stored precursor
                        intelligence.
                    </p>
                </div>

                {error ? (
                    <div className="p-5 rounded-[5px] border border-[#f0d4d4] bg-[#fff8f8]">
                        <div className="text-[#c62828] text-[10px] font-extrabold">
                            Unable to load current priorities
                        </div>
                        <p className="mt-1 text-[#8a5f5f] text-[9px]">
                            {error}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="p-5 rounded-[5px] border border-[#d9e2dc] bg-white">
                            <div className="text-[#718078] text-[8px] font-extrabold tracking-[0.1em]">
                                RISK PATTERNS
                            </div>

                            <div className="mt-3 text-[#17211b] text-[24px] leading-none font-extrabold">
                                {loading ? "—" : scoreSummary.count}
                            </div>
                        </div>

                        <div className="p-5 rounded-[5px] border border-[#d9e2dc] bg-white">
                            <div className="text-[#718078] text-[8px] font-extrabold tracking-[0.1em]">
                                AVERAGE PRIORITY
                            </div>

                            <div className="mt-3 text-[#17211b] text-[24px] leading-none font-extrabold">
                                {loading
                                    ? "—"
                                    : formatScore(scoreSummary.average)}
                            </div>
                        </div>

                        <div className="p-5 rounded-[5px] border border-[#d9e2dc] bg-white">
                            <div className="text-[#718078] text-[8px] font-extrabold tracking-[0.1em]">
                                HIGHEST PRIORITY
                            </div>

                            <div className="mt-3 flex items-end gap-2">
                                <span className="text-[#17211b] text-[24px] leading-none font-extrabold">
                                    {loading
                                        ? "—"
                                        : formatScore(
                                              scoreSummary.highest
                                          )}
                                </span>

                                {!loading &&
                                    scoreSummary.highest !== null && (
                                        <span
                                            className={`mb-0.5 px-2 py-1 rounded-full text-[7px] font-extrabold ${
                                                getPriorityLabel(
                                                    scoreSummary.highest
                                                ).className
                                            }`}
                                        >
                                            {
                                                getPriorityLabel(
                                                    scoreSummary.highest
                                                ).label
                                            }
                                        </span>
                                    )}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* Collapsible weights */}
            <section className="mt-5 rounded-[6px] border border-[#d9e2dc] bg-white overflow-hidden">
                <button
                    type="button"
                    onClick={() => setWeightsOpen((current) => !current)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-[#f8faf9]"
                >
                    <div>
                        <div className="text-[#17211b] text-[12px] font-extrabold">
                            Current priority factors
                        </div>

                        <div className="mt-1 text-[#8a958e] text-[9px]">
                            The current weighting used to interpret the
                            priority score.
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[#087542] text-[9px] font-extrabold">
                            100% total
                        </span>

                        <span className="text-[#087542] text-[15px] font-bold">
                            {weightsOpen ? "⌃" : "⌄"}
                        </span>
                    </div>
                </button>

                {weightsOpen && (
                    <div className="px-5 pb-5 border-t border-[#e5ebe7]">
                        <div className="pt-4 space-y-4">
                            {CURRENT_WEIGHTS.map((item) => (
                                <div
                                    key={item.key}
                                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5"
                                >
                                    <div className="sm:w-[190px] shrink-0">
                                        <div className="text-[#17211b] text-[10px] font-bold">
                                            {item.label}
                                        </div>

                                        <div className="mt-0.5 text-[#8a958e] text-[8px] leading-[1.4]">
                                            {item.description}
                                        </div>
                                    </div>

                                    <div className="flex-1 flex items-center gap-3">
                                        <div className="h-2 flex-1 rounded-full bg-[#edf2ee] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-[#087542]"
                                                style={{
                                                    width: `${item.weight}%`,
                                                }}
                                            />
                                        </div>

                                        <span className="w-10 text-right text-[#087542] text-[10px] font-extrabold">
                                            {item.weight}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 p-4 rounded-[5px] bg-[#f8faf9]">
                            <div className="text-[#718078] text-[8px] font-extrabold tracking-[0.1em]">
                                IMPORTANT
                            </div>

                            <p className="mt-1 text-[#718078] text-[9px] leading-[1.6]">
                                These are the current prototype weights. This
                                screen is explanatory only; changing these
                                values here does not retrain MuRIL or mutate
                                the persisted ML result.
                            </p>
                        </div>
                    </div>
                )}
            </section>

            {/* Factor explanation */}
            <section className="mt-5">
                <div className="mb-3">
                    <div className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                        WHAT CONTRIBUTES TO PRIORITY?
                    </div>

                    <p className="mt-1 text-[#8a958e] text-[10px]">
                        Five factors are considered in the current prototype.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {CURRENT_WEIGHTS.map((item) => (
                        <div
                            key={item.key}
                            className="p-4 rounded-[5px] border border-[#d9e2dc] bg-white"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <div className="text-[#17211b] text-[11px] font-extrabold">
                                        {item.label}
                                    </div>

                                    <p className="mt-1 text-[#8a958e] text-[9px] leading-[1.6]">
                                        {item.description}
                                    </p>
                                </div>

                                <span className="shrink-0 px-2 py-1 rounded-full bg-[#edf7f1] text-[#087542] text-[8px] font-extrabold">
                                    {item.weight}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Connection to workspace */}
            <section className="mt-5 p-5 rounded-[6px] border border-[#d9e2dc] bg-[#f8faf9]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="text-[#718078] text-[8px] font-extrabold tracking-[0.12em]">
                            WHERE THIS IS USED
                        </div>

                        <h3 className="mt-1 text-[#17211b] text-[12px] font-extrabold">
                            Emerging Risks
                        </h3>

                        <p className="mt-1 max-w-[760px] text-[#718078] text-[9px] leading-[1.6]">
                            The priority score is surfaced beside recurring
                            risk patterns so safety teams can see which
                            patterns currently deserve attention first. Use
                            Emerging Risks for the actual risk list; use this
                            tab when you need to understand what the score
                            means.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default RiskScore;
