import { useMemo, useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const label = (value) => {
    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {
        return "—";
    }

    return String(value)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const score = (value) => {
    if (
        value === null ||
        value === undefined ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return Number(value).toFixed(2);
};

const meaningful = (value) =>
    value !== null &&
    value !== undefined &&
    String(value).trim() !== "" &&
    String(value).trim().toUpperCase() !== "NOT_STATED";

const healthClass = (value) => {
    const health = String(value || "").toLowerCase();

    if (health === "critical") {
        return "bg-[#fff0f0] text-[#c62828]";
    }

    if (health === "degrading") {
        return "bg-[#fff7e8] text-[#a15c00]";
    }

    if (health === "healthy") {
        return "bg-[#edf8f1] text-[#087542]";
    }

    return "bg-[#f1f4f2] text-[#66736b]";
};

const trend = (value) => {
    const trendValue = String(value || "").toLowerCase();

    if (
        trendValue.includes("increas") ||
        trendValue.includes("up")
    ) {
        return ["↑", "Increasing", "text-[#c62828]"];
    }

    if (
        trendValue.includes("decreas") ||
        trendValue.includes("down")
    ) {
        return ["↓", "Decreasing", "text-[#087542]"];
    }

    if (trendValue.includes("stable")) {
        return ["→", "Stable", "text-[#5d6f9a]"];
    }

    return ["—", "Not stated", "text-[#718078]"];
};

function EmergingRisks({ clusters = [], onRefresh }) {
    const [trendFilter, setTrendFilter] = useState("");
    const [healthFilter, setHealthFilter] = useState("");
    const [selected, setSelected] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");

    const filtered = useMemo(
        () =>
            clusters.filter((cluster) => {
                const trendValue = String(
                    cluster.trend || ""
                ).toLowerCase();
                const healthValue = String(
                    cluster.barrier_health || ""
                ).toLowerCase();

                return (
                    (!trendFilter ||
                        trendValue.includes(trendFilter)) &&
                    (!healthFilter || healthValue === healthFilter)
                );
            }),
        [clusters, trendFilter, healthFilter]
    );

    const totals = {
        clusters: filtered.length,
        reports: filtered.reduce(
            (sum, cluster) =>
                sum + Number(cluster.report_count || 0),
            0
        ),
        critical: filtered.filter(
            (cluster) =>
                String(cluster.barrier_health || "").toLowerCase() ===
                "critical"
        ).length,
        degrading: filtered.filter(
            (cluster) =>
                String(cluster.barrier_health || "").toLowerCase() ===
                "degrading"
        ).length,
    };

    const open = async (cluster) => {
        try {
            setSelected({ summary: cluster, detail: null });
            setDetailLoading(true);
            setDetailError("");

            const response = await fetch(
                `${API_BASE_URL}/ml/clusters/${encodeURIComponent(
                    cluster.cluster_id
                )}`
            );

            const payload = await response.json();

            if (!response.ok || !payload?.success) {
                throw new Error(
                    payload?.message ||
                        "Failed to load risk details."
                );
            }

            setSelected({
                summary: cluster,
                detail: payload.data || null,
            });
        } catch (error) {
            console.error("Risk detail loading error:", error);
            setDetailError(
                error?.message ||
                    "Unable to load risk details."
            );
        } finally {
            setDetailLoading(false);
        }
    };

    const clearFilters = () => {
        setTrendFilter("");
        setHealthFilter("");
    };

    return (
        <>
            <style>{`
                @media (min-width: 1024px) {
                    .emerging-risk-grid {
                        grid-template-columns: 60px minmax(260px, 1.8fr) 90px 90px 150px 140px 30px;
                    }
                }
            `}</style>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[
                    ["EMERGING RISKS", totals.clusters],
                    ["REPORTS CONNECTED", totals.reports],
                    ["CRITICAL BARRIERS", totals.critical],
                    ["DEGRADING BARRIERS", totals.degrading],
                ].map(([key, value]) => (
                    <div
                        key={key}
                        className="min-h-[125px] p-6 rounded-[6px] border border-[#d9e2dc] bg-white shadow-[0_8px_25px_rgba(20,50,35,0.055)]"
                    >
                        <span className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                            {key}
                        </span>
                        <strong className="block mt-6 text-[#17211b] text-[36px] leading-none font-extrabold">
                            {value}
                        </strong>
                    </div>
                ))}
            </div>

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-[#17211b] text-[18px] font-extrabold">
                            Emerging Safety Risks
                        </h2>
                        <span className="px-2.5 py-1 rounded-full bg-[#eaf4ee] text-[#087542] text-[8px] font-extrabold">
                            CROSS-REPORT
                        </span>
                    </div>
                    <p className="mt-1 text-[#8a958e] text-[11px]">
                        Recurring patterns ranked by priority, trend and
                        barrier condition.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                        value={trendFilter}
                        onChange={(event) =>
                            setTrendFilter(event.target.value)
                        }
                        className="min-w-[165px] px-4 py-3 rounded-[4px] border border-[#d5dfd8] bg-white text-[#59655e] text-[11px] font-bold outline-none"
                    >
                        <option value="">All trends</option>
                        <option value="increasing">Increasing</option>
                        <option value="stable">Stable</option>
                        <option value="decreasing">Decreasing</option>
                    </select>

                    <select
                        value={healthFilter}
                        onChange={(event) =>
                            setHealthFilter(event.target.value)
                        }
                        className="min-w-[165px] px-4 py-3 rounded-[4px] border border-[#d5dfd8] bg-white text-[#59655e] text-[11px] font-bold outline-none"
                    >
                        <option value="">All barrier health</option>
                        <option value="critical">Critical</option>
                        <option value="degrading">Degrading</option>
                        <option value="healthy">Healthy</option>
                    </select>

                    {(trendFilter || healthFilter) && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="px-4 py-3 rounded-[4px] border border-[#d5dfd8] bg-white text-[#59655e] text-[11px] font-bold cursor-pointer"
                        >
                            Clear
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onRefresh}
                        className="px-4 py-3 rounded-[4px] bg-[#087542] text-white text-[11px] font-extrabold cursor-pointer hover:bg-[#066338]"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-[6px] border border-[#d9e2dc] bg-white shadow-[0_8px_25px_rgba(20,50,35,0.055)]">
                {/* Desktop header — explicit grid template avoids Tailwind arbitrary-grid parsing issues. */}
                <div
                    className="emerging-risk-grid hidden lg:grid items-center px-6 py-4 border-b border-[#e5ebe7] bg-[#f7faf8] text-[#718078] text-[9px] font-extrabold tracking-[0.1em]"
                    style={{
                        gridTemplateColumns:
                            "60px minmax(260px, 1.8fr) 90px 90px 150px 140px 30px",
                    }}
                >
                    <span>RANK</span>
                    <span>RISK PATTERN</span>
                    <span>SITES</span>
                    <span>REPORTS</span>
                    <span>TREND</span>
                    <span>PRIORITY / HEALTH</span>
                    <span />
                </div>

                {filtered.length === 0 ? (
                    <div className="p-12 text-center text-[#718078] text-[11px]">
                        No matching risks found.
                    </div>
                ) : (
                    filtered.map((cluster, index) => {
                        const [symbol, trendLabel, trendColor] = trend(
                            cluster.trend
                        );

                        return (
                            <button
                                key={cluster.cluster_id}
                                type="button"
                                onClick={() => open(cluster)}
                                className="emerging-risk-grid w-full grid grid-cols-1 gap-4 px-6 py-5 border-0 border-b border-[#edf1ee] bg-white text-left cursor-pointer hover:bg-[#f7faf8] lg:items-center lg:gap-0"
                            >
                                <span className="text-[#087542] text-[12px] font-extrabold">
                                    {String(index + 1).padStart(2, "0")}
                                </span>

                                <span className="min-w-0">
                                    <strong className="block text-[#17211b] text-[14px] font-bold truncate">
                                        {label(cluster.cluster_id)}
                                    </strong>
                                    <small className="block mt-1 text-[#8a958e] text-[10px] truncate">
                                        {cluster.cluster_id}
                                    </small>
                                </span>

                                <span className="text-[#59655e] text-[12px] font-semibold">
                                    {cluster.unique_sites ?? "—"}
                                </span>

                                <span className="text-[#17211b] text-[15px] font-extrabold">
                                    {cluster.report_count ?? 0}
                                </span>

                                <span className="flex items-center gap-2">
                                    <b
                                        className={`text-[18px] ${trendColor}`}
                                    >
                                        {symbol}
                                    </b>
                                    <span className="text-[#59655e] text-[11px] font-semibold">
                                        {trendLabel}
                                    </span>
                                </span>

                                <span className="flex flex-col gap-2">
                                    <b className="text-[#17211b] text-[13px]">
                                        {score(cluster.sbri_score)}
                                    </b>
                                    <span
                                        className={`w-fit px-2 py-1 rounded-full text-[8px] font-extrabold ${healthClass(
                                            cluster.barrier_health
                                        )}`}
                                    >
                                        {label(cluster.barrier_health)}
                                    </span>
                                </span>

                                <span className="hidden lg:block text-[#087542] text-[20px]">
                                    →
                                </span>
                            </button>
                        );
                    })
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 z-[100] bg-black/45 p-4 sm:p-8 flex items-center justify-center">
                    <div className="w-full max-w-[1100px] max-h-[90vh] overflow-y-auto rounded-[7px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
                        <div className="sticky top-0 z-10 flex items-start justify-between gap-6 px-7 py-6 border-b border-[#e3e9e5] bg-white">
                            <div>
                                <span className="text-[#087542] text-[9px] font-extrabold tracking-[0.13em]">
                                    EMERGING SAFETY RISK
                                </span>
                                <h2 className="mt-2 text-[#17211b] text-[25px] font-extrabold">
                                    {label(selected.summary?.cluster_id)}
                                </h2>
                                <p className="mt-1 text-[#8a958e] text-[10px]">
                                    {selected.summary?.cluster_id}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="w-9 h-9 rounded-full border border-[#dce5df] bg-white text-[#718078] text-[18px] cursor-pointer"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 p-7 sm:grid-cols-4">
                            {[
                                [
                                    "REPORTS",
                                    selected.summary?.report_count ?? 0,
                                ],
                                [
                                    "SITES",
                                    selected.summary?.unique_sites ?? "—",
                                ],
                                [
                                    "PRIORITY",
                                    score(selected.summary?.sbri_score),
                                ],
                                [
                                    "TREND",
                                    label(selected.summary?.trend),
                                ],
                            ].map(([key, value]) => (
                                <div
                                    key={key}
                                    className="p-4 rounded-[5px] border border-[#dce5df] bg-[#f7faf8]"
                                >
                                    <span className="block mb-2 text-[#718078] text-[8px] font-extrabold">
                                        {key}
                                    </span>
                                    <b className="text-[#17211b] text-[17px]">
                                        {value}
                                    </b>
                                </div>
                            ))}
                        </div>

                        <div className="px-7 pb-8">
                            {detailLoading ? (
                                <div className="p-10 text-center text-[#718078]">
                                    Loading source reports…
                                </div>
                            ) : detailError ? (
                                <div className="p-7 rounded-[5px] border border-[#f0d4d4] bg-[#fff8f8] text-[#c62828] text-[12px] font-bold">
                                    {detailError}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(selected.detail?.results || []).map(
                                        (report, index) => (
                                            <div
                                                key={
                                                    report.report_id || index
                                                }
                                                className="p-5 rounded-[5px] border border-[#dce5df]"
                                            >
                                                <div className="text-[#087542] text-[9px] font-extrabold">
                                                    {report.report_id}
                                                </div>
                                                <h3 className="mt-2 text-[#17211b] text-[14px] font-extrabold">
                                                    {report.activity ||
                                                        "Safety report"}
                                                </h3>

                                                <div className="grid grid-cols-1 gap-3 mt-5 sm:grid-cols-2 lg:grid-cols-4">
                                                    {[
                                                        [
                                                            "LOCATION",
                                                            report.location,
                                                        ],
                                                        [
                                                            "BARRIER",
                                                            report.barrier_or_control,
                                                        ],
                                                        [
                                                            "FAILURE MODE",
                                                            report.barrier_failure_mode,
                                                        ],
                                                        [
                                                            "BARRIER FUNCTION",
                                                            report.barrier_function,
                                                        ],
                                                    ]
                                                        .filter(([, value]) =>
                                                            meaningful(value)
                                                        )
                                                        .map(
                                                            ([key, value]) => (
                                                                <div
                                                                    key={key}
                                                                    className="p-3 rounded-[4px] bg-[#f7faf8] border border-[#e1e8e3]"
                                                                >
                                                                    <span className="block mb-1 text-[#8a958e] text-[8px] font-extrabold">
                                                                        {key}
                                                                    </span>
                                                                    <div className="text-[#46534b] text-[11px] font-semibold">
                                                                        {label(
                                                                            value
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                </div>

                                                {Array.isArray(
                                                    report.lsr_tags
                                                ) &&
                                                    report.lsr_tags.length >
                                                        0 && (
                                                        <div className="mt-5">
                                                            <span className="block mb-2 text-[#718078] text-[8px] font-extrabold">
                                                                SAFETY RULES
                                                            </span>
                                                            <div className="flex flex-wrap gap-2">
                                                                {report.lsr_tags.map(
                                                                    (tag) => (
                                                                        <span
                                                                            key={tag}
                                                                            className="px-3 py-1.5 rounded-full bg-[#edf2ff] text-[#3157a5] text-[9px] font-bold"
                                                                        >
                                                                            {tag}
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {Array.isArray(
                                                    report.evidence_phrases
                                                ) &&
                                                    report.evidence_phrases
                                                        .length > 0 && (
                                                        <div className="mt-5">
                                                            <span className="block mb-2 text-[#718078] text-[8px] font-extrabold">
                                                                WHY THIS WAS
                                                                FLAGGED
                                                            </span>
                                                            {report.evidence_phrases.map(
                                                                (
                                                                    phrase,
                                                                    phraseIndex
                                                                ) => (
                                                                    <div
                                                                        key={`${phrase}-${phraseIndex}`}
                                                                        className="mb-2 p-3 rounded-[4px] border-l-[3px] border-[#087542] bg-[#f7faf8] text-[#46534b] text-[11px] font-semibold"
                                                                    >
                                                                        “{phrase}”
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end px-7 py-5 border-t border-[#e3e9e5] bg-[#f7faf8]">
                            <button
                                type="button"
                                onClick={() => setSelected(null)}
                                className="px-5 py-3 rounded-[3px] border border-[#d5dfd8] bg-white text-[#59655e] text-[12px] font-bold cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default EmergingRisks;
