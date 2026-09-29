import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getTrend = (trend) => {
    const value = String(trend || "").toLowerCase();

    if (value.includes("increas") || value.includes("up")) {
        return {
            symbol: "↑",
            label: "Increasing",
            className: "text-[#c62828]",
            order: 0,
        };
    }

    if (value.includes("stable")) {
        return {
            symbol: "→",
            label: "Stable",
            className: "text-[#5d6f9a]",
            order: 1,
        };
    }

    if (value.includes("decreas") || value.includes("down")) {
        return {
            symbol: "↓",
            label: "Decreasing",
            className: "text-[#087542]",
            order: 2,
        };
    }

    return {
        symbol: "—",
        label: "Not stated",
        className: "text-[#718078]",
        order: 3,
    };
};

const formatLabel = (value) => {
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

const formatDate = (date) =>
    date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
    });

const formatDateInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const startOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

const endOfDay = (date) =>
    new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
    );

const getPresetStart = (days) => {
    const today = startOfDay(new Date());
    today.setDate(today.getDate() - (days - 1));
    return today;
};

const getWeekStart = (date) => {
    const result = startOfDay(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    return result;
};

function RiskTrends({ clusters = [] }) {
    const [dateMode, setDateMode] = useState("30");
    const [customStart, setCustomStart] = useState("");
    const [customEnd, setCustomEnd] = useState("");

    const [clusterReports, setClusterReports] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const loadReportDates = async () => {
            try {
                setLoading(true);
                setError("");

                const clusterResponses = await Promise.all(
                    clusters.map(async (cluster) => {
                        const response = await fetch(
                            `${API_BASE_URL}/ml/clusters/${encodeURIComponent(
                                cluster.cluster_id
                            )}`
                        );

                        const payload = await response.json();

                        if (!response.ok || !payload?.success) {
                            throw new Error(
                                payload?.message ||
                                    `Failed to load ${cluster.cluster_id}.`
                            );
                        }

                        const results = payload?.data?.results || [];

                        const reportDates = await Promise.all(
                            results.map(async (result) => {
                                if (!result?.report_id) return null;

                                try {
                                    const reportResponse = await fetch(
                                        `${API_BASE_URL}/reports/${encodeURIComponent(
                                            result.report_id
                                        )}`
                                    );

                                    if (!reportResponse.ok) return null;

                                    const reportPayload =
                                        await reportResponse.json();

                                    const report =
                                        reportPayload?.data ||
                                        reportPayload?.report;

                                    if (!report?.report_date) return null;

                                    return {
                                        report_id: result.report_id,
                                        report_date: report.report_date,
                                    };
                                } catch {
                                    return null;
                                }
                            })
                        );

                        return {
                            cluster_id: cluster.cluster_id,
                            reports: reportDates.filter(Boolean),
                        };
                    })
                );

                if (!cancelled) {
                    const nextMap = {};

                    clusterResponses.forEach((item) => {
                        nextMap[item.cluster_id] = item.reports;
                    });

                    setClusterReports(nextMap);
                }
            } catch (err) {
                if (!cancelled) {
                    console.error("Trend report loading error:", err);
                    setError(
                        err?.message ||
                            "Unable to load report dates for the trend view."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        if (clusters.length > 0) {
            loadReportDates();
        } else {
            setClusterReports({});
            setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [clusters]);

    const dateRange = useMemo(() => {
        const today = startOfDay(new Date());

        if (dateMode === "all") {
            return {
                start: null,
                end: endOfDay(today),
                label: "All available reports",
            };
        }

        if (dateMode === "custom") {
            if (!customStart || !customEnd) {
                return {
                    start: null,
                    end: endOfDay(today),
                    invalid: false,
                    incomplete: true,
                    label: "Select a start and end date",
                };
            }

            const start = startOfDay(new Date(`${customStart}T00:00:00`));
            const end = endOfDay(new Date(`${customEnd}T00:00:00`));

            if (
                Number.isNaN(start.getTime()) ||
                Number.isNaN(end.getTime()) ||
                start > end
            ) {
                return {
                    start,
                    end,
                    invalid: true,
                    incomplete: false,
                    label: "Invalid date range",
                };
            }

            return {
                start,
                end,
                invalid: false,
                incomplete: false,
                label: `${formatDate(start)} – ${formatDate(end)}`,
            };
        }

        const days = Number(dateMode);

        return {
            start: getPresetStart(days),
            end: endOfDay(today),
            invalid: false,
            incomplete: false,
            label: `Last ${days} days`,
        };
    }, [dateMode, customStart, customEnd]);

    const isInSelectedRange = (date) => {
        if (!date || Number.isNaN(date.getTime())) return false;

        const normalized = startOfDay(date);

        if (dateRange.start && normalized < dateRange.start) {
            return false;
        }

        if (dateRange.end && normalized > dateRange.end) {
            return false;
        }

        return true;
    };

    const filteredClusters = useMemo(() => {
        if (dateRange.invalid || dateRange.incomplete) return [];

        return clusters
            .map((cluster) => {
                const reports = clusterReports[cluster.cluster_id] || [];

                const matchingReports = reports.filter((report) =>
                    isInSelectedRange(new Date(report.report_date))
                );

                return {
                    ...cluster,
                    filteredReportCount: matchingReports.length,
                    filteredReports: matchingReports,
                };
            })
            .filter((cluster) => {
                if (dateMode === "all") return true;
                return cluster.filteredReportCount > 0;
            })
            .sort((a, b) => {
                const trendA = getTrend(a.trend);
                const trendB = getTrend(b.trend);

                if (trendA.order !== trendB.order) {
                    return trendA.order - trendB.order;
                }

                return (
                    Number(b.sbri_score || 0) -
                    Number(a.sbri_score || 0)
                );
            });
    }, [
        clusters,
        clusterReports,
        dateRange,
        dateMode,
        customStart,
        customEnd,
    ]);

    const groupedRisks = useMemo(() => {
        return {
            increasing: filteredClusters.filter(
                (cluster) =>
                    getTrend(cluster.trend).label === "Increasing"
            ),
            stable: filteredClusters.filter(
                (cluster) => getTrend(cluster.trend).label === "Stable"
            ),
            decreasing: filteredClusters.filter(
                (cluster) =>
                    getTrend(cluster.trend).label === "Decreasing"
            ),
            other: filteredClusters.filter(
                (cluster) =>
                    !["Increasing", "Stable", "Decreasing"].includes(
                        getTrend(cluster.trend).label
                    )
            ),
        };
    }, [filteredClusters]);

    const trendData = useMemo(() => {
        if (dateRange.invalid || dateRange.incomplete) return [];

        const allDates = Object.values(clusterReports)
            .flat()
            .map((report) => new Date(report.report_date))
            .filter((date) => isInSelectedRange(date));

        if (allDates.length === 0) return [];

        const actualStart =
            dateRange.start ||
            new Date(Math.min(...allDates.map((date) => date.getTime())));

        const actualEnd = dateRange.end || startOfDay(new Date());

        const totalDays =
            Math.floor(
                (startOfDay(actualEnd).getTime() -
                    startOfDay(actualStart).getTime()) /
                    (1000 * 60 * 60 * 24)
            ) + 1;

        const weekCount = Math.max(1, Math.ceil(totalDays / 7));

        const buckets = Array.from({ length: weekCount }, (_, index) => {
            const start = new Date(actualStart);
            start.setDate(start.getDate() + index * 7);

            return {
                start,
                count: 0,
            };
        });

        allDates.forEach((date) => {
            const diffDays = Math.floor(
                (startOfDay(date).getTime() -
                    startOfDay(actualStart).getTime()) /
                    (1000 * 60 * 60 * 24)
            );

            const index = Math.min(
                weekCount - 1,
                Math.max(0, Math.floor(diffDays / 7))
            );

            buckets[index].count += 1;
        });

        return buckets.map((bucket) => ({
            ...bucket,
            label: formatDate(bucket.start),
        }));
    }, [clusterReports, dateRange]);

    const stats = useMemo(() => {
        const reportsInWindow = filteredClusters.reduce(
            (sum, cluster) => sum + cluster.filteredReportCount,
            0
        );

        return {
            reportsInWindow,
            increasing: groupedRisks.increasing.length,
            stable: groupedRisks.stable.length,
            decreasing: groupedRisks.decreasing.length,
        };
    }, [filteredClusters, groupedRisks]);

    const chart = useMemo(() => {
        const width = 900;
        const height = 300;
        const left = 54;
        const right = 22;
        const top = 22;
        const bottom = 48;

        const innerWidth = width - left - right;
        const innerHeight = height - top - bottom;

        const maxValue = Math.max(
            1,
            ...trendData.map((bucket) => bucket.count)
        );

        const yStep = maxValue <= 4 ? 1 : Math.ceil(maxValue / 4);
        const yMax = Math.max(yStep * 4, 1);

        const points = trendData.map((bucket, index) => {
            const x =
                left +
                (index / Math.max(trendData.length - 1, 1)) *
                    innerWidth;

            const y =
                top +
                innerHeight -
                (bucket.count / yMax) * innerHeight;

            return {
                ...bucket,
                x,
                y,
            };
        });

        const line = points
            .map((point) => `${point.x},${point.y}`)
            .join(" ");

        const yTicks = Array.from({ length: 5 }, (_, index) => {
            const value = yMax - index * yStep;

            return {
                value,
                y: top + (index / 4) * innerHeight,
            };
        });

        const labelStep =
            points.length <= 5
                ? 1
                : Math.ceil(points.length / 5);

        return {
            width,
            height,
            left,
            right,
            top,
            bottom,
            points,
            line,
            yTicks,
            labelStep,
        };
    }, [trendData]);

    const renderRiskCard = (cluster) => {
        const trend = getTrend(cluster.trend);

        return (
            <div
                key={cluster.cluster_id}
                className="px-4 py-3 rounded-[5px] border border-[#d9e2dc] bg-white hover:border-[#b9cec0] transition-colors"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="truncate text-[#17211b] text-[11px] font-bold">
                            {formatLabel(cluster.cluster_id)}
                        </div>

                        <div className="mt-1 text-[#8a958e] text-[9px]">
                            {cluster.filteredReportCount}{" "}
                            {cluster.filteredReportCount === 1
                                ? "report"
                                : "reports"}{" "}
                            in selected period
                        </div>
                    </div>

                    <span
                        className={`shrink-0 text-[18px] font-extrabold ${trend.className}`}
                    >
                        {trend.symbol}
                    </span>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-[#8a958e] text-[8px] font-extrabold tracking-[0.08em]">
                            PRIORITY
                        </div>
                        <div className="mt-0.5 text-[#17211b] text-[11px] font-bold">
                            {cluster.sbri_score !== null &&
                            cluster.sbri_score !== undefined
                                ? Number(cluster.sbri_score).toFixed(2)
                                : "—"}
                        </div>
                    </div>

                    <div>
                        <div className="text-[#8a958e] text-[8px] font-extrabold tracking-[0.08em]">
                            DIRECTION
                        </div>
                        <div
                            className={`mt-1 text-[10px] font-extrabold ${trend.className}`}
                        >
                            {trend.label}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="mb-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-[#17211b] text-[18px] font-extrabold">
                                Risk Trends
                            </h2>

                            <span className="px-2.5 py-1 rounded-full bg-[#eaf4ee] text-[#087542] text-[8px] font-extrabold tracking-[0.08em]">
                                PATTERN DIRECTION
                            </span>
                        </div>

                        <p className="mt-1 text-[#8a958e] text-[11px]">
                            See how recurring safety patterns change over time.
                        </p>
                    </div>
                </div>
            </div>

            {dateMode === "custom" && (
                <div className="mb-6 p-4 rounded-[5px] border border-[#d9e2dc] bg-[#f8faf9]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <label className="flex-1">
                            <span className="block mb-1 text-[#718078] text-[8px] font-extrabold tracking-[0.1em]">
                                FROM
                            </span>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(event) =>
                                    setCustomStart(event.target.value)
                                }
                                className="w-full h-10 px-3 rounded-[4px] border border-[#d5dfd8] bg-white text-[#17211b] text-[10px] outline-none focus:border-[#087542]"
                            />
                        </label>

                        <label className="flex-1">
                            <span className="block mb-1 text-[#718078] text-[8px] font-extrabold tracking-[0.1em]">
                                TO
                            </span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(event) =>
                                    setCustomEnd(event.target.value)
                                }
                                className="w-full h-10 px-3 rounded-[4px] border border-[#d5dfd8] bg-white text-[#17211b] text-[10px] outline-none focus:border-[#087542]"
                            />
                        </label>

                        <div className="sm:max-w-[260px] text-[#718078] text-[9px] leading-[1.5]">
                            Choose any reporting period. The chart and risk
                            groups below will use only reports inside this
                            range.
                        </div>
                    </div>

                    {dateRange.invalid && (
                        <div className="mt-3 text-[#c62828] text-[9px] font-bold">
                            Please choose a valid start and end date.
                        </div>
                    )}
                </div>
            )}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                        SELECTED PERIOD
                    </div>
                    <div className="mt-1 text-[#17211b] text-[12px] font-bold">
                        {dateRange.label}
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex rounded-[5px] border border-[#d5dfd8] bg-white overflow-hidden">
                        {[
                            ["all", "ALL"],
                            ["30", "30 DAYS"],
                            ["60", "60 DAYS"],
                            ["90", "90 DAYS"],
                            ["custom", "CUSTOM"],
                        ].map(([value, label]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setDateMode(value)}
                                className={`px-3 py-2.5 text-[9px] font-extrabold cursor-pointer ${
                                    dateMode === value
                                        ? "bg-[#087542] text-white"
                                        : "text-[#66736b] hover:bg-[#f1f6f3]"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-7">
                {[
                    ["REPORTS IN PERIOD", stats.reportsInWindow],
                    ["INCREASING RISKS", stats.increasing],
                    ["STABLE RISKS", stats.stable],
                    ["DECREASING RISKS", stats.decreasing],
                ].map(([label, value]) => (
                    <div
                        key={label}
                        className="min-h-[118px] p-6 rounded-[6px] border border-[#d9e2dc] bg-white shadow-[0_8px_25px_rgba(20,50,35,0.055)]"
                    >
                        <span className="text-[#718078] text-[9px] font-extrabold tracking-[0.11em]">
                            {label}
                        </span>

                        <strong className="block mt-5 text-[#17211b] text-[30px] leading-none font-extrabold tracking-[-0.04em]">
                            {value}
                        </strong>
                    </div>
                ))}
            </div>

            <div className="p-6 rounded-[6px] border border-[#d9e2dc] bg-white">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                            REPORT ACTIVITY
                        </div>
                        <div className="mt-1 text-[#17211b] text-[14px] font-extrabold">
                            {dateRange.label}
                        </div>
                    </div>

                    <div className="text-[#8a958e] text-[9px]">
                        Each point = reports filed during that week
                    </div>
                </div>

                {loading ? (
                    <div className="h-[330px] mt-5 flex items-center justify-center rounded-[5px] bg-[#f8faf9] text-[#718078] text-[11px]">
                        Loading report activity…
                    </div>
                ) : error ? (
                    <div className="mt-5 p-6 rounded-[5px] border border-[#f0d4d4] bg-[#fff8f8]">
                        <div className="text-[#c62828] text-[11px] font-bold">
                            Unable to load trend data
                        </div>
                        <p className="mt-2 text-[#8a5f5f] text-[10px]">
                            {error}
                        </p>
                    </div>
                ) : dateRange.incomplete ? (
                    <div className="h-[260px] mt-5 flex items-center justify-center rounded-[5px] bg-[#f8faf9] text-[#718078] text-[11px]">
                        Select both dates to view the reporting trend.
                    </div>
                ) : trendData.length === 0 ? (
                    <div className="h-[260px] mt-5 flex flex-col items-center justify-center rounded-[5px] bg-[#f8faf9] text-center">
                        <div className="text-[#17211b] text-[13px] font-extrabold">
                            No reports in this period
                        </div>
                        <p className="max-w-[440px] mt-2 text-[#8a958e] text-[10px] leading-[1.6]">
                            Try a longer date range or choose All to see every
                            available clustered report.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 w-full overflow-x-auto">
                        <div className="min-w-[680px]">
                            <svg
                                viewBox={`0 0 ${chart.width}  ${chart.height}`}
                                className="w-full h-[310px]"
                                role="img"
                                aria-label={`${dateRange.label} report activity trend`}
                            >
                                {chart.yTicks.map((tick) => (
                                    <g key={tick.value}>
                                        <line
                                            x1={chart.left}
                                            y1={tick.y}
                                            x2={
                                                chart.width -
                                                chart.right
                                            }
                                            y2={tick.y}
                                            stroke="#e7eee9"
                                            strokeWidth="1"
                                        />

                                        <text
                                            x={chart.left - 12}
                                            y={tick.y + 4}
                                            textAnchor="end"
                                            fontSize="11"
                                            fill="#718078"
                                        >
                                            {tick.value}
                                        </text>
                                    </g>
                                ))}

                                <line
                                    x1={chart.left}
                                    y1={
                                        chart.height -
                                        chart.bottom
                                    }
                                    x2={
                                        chart.width -
                                        chart.right
                                    }
                                    y2={
                                        chart.height -
                                        chart.bottom
                                    }
                                    stroke="#cfdad3"
                                    strokeWidth="1"
                                />

                                <polyline
                                    points={chart.line}
                                    fill="none"
                                    stroke="#087542"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {chart.points.map((point, index) => (
                                    <g key={`${point.label}-${index}`}>
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r="5"
                                            fill="#ffffff"
                                            stroke="#087542"
                                            strokeWidth="3"
                                        />

                                        <text
                                            x={point.x}
                                            y={point.y - 12}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fontWeight="700"
                                            fill="#17211b"
                                        >
                                            {point.count}
                                        </text>

                                        {(index %
                                            chart.labelStep ===
                                            0 ||
                                            index ===
                                                chart.points.length - 1) && (
                                            <text
                                                x={point.x}
                                                y={
                                                    chart.height -
                                                    chart.bottom +
                                                    24
                                                }
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill="#718078"
                                            >
                                                {point.label}
                                            </text>
                                        )}
                                    </g>
                                ))}
                            </svg>
                        </div>
                    </div>
                )}

                <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-[#8a958e] text-[9px]">
                    <span>
                        <strong className="text-[#59655e]">
                            Source:
                        </strong>{" "}
                        original report dates
                    </span>

                    <span>
                        <strong className="text-[#59655e]">
                            Interpretation:
                        </strong>{" "}
                        descriptive activity, not forecasting
                    </span>
                </div>
            </div>

            <div className="mt-7">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                            RISK PATTERNS IN SELECTED PERIOD
                        </div>
                        <p className="mt-1 text-[#8a958e] text-[10px]">
                            Ordered from increasing risk → stable → decreasing.
                        </p>
                    </div>

                    <div className="text-[#8a958e] text-[9px]">
                        Sorted by priority within each group
                    </div>
                </div>

                {filteredClusters.length === 0 && !loading ? (
                    <div className="p-8 rounded-[5px] border border-[#d9e2dc] bg-white text-center">
                        <div className="text-[#17211b] text-[13px] font-extrabold">
                            No risk patterns found
                        </div>
                        <p className="mt-2 text-[#8a958e] text-[10px]">
                            Try a longer reporting period or choose All.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {[
                            {
                                key: "increasing",
                                title: "Increasing Risks",
                                subtitle:
                                    "Patterns showing an increasing direction.",
                                risks: groupedRisks.increasing,
                                color: "text-[#c62828]",
                                symbol: "↑",
                            },
                            {
                                key: "stable",
                                title: "Stable Risks",
                                subtitle:
                                    "Patterns currently showing a stable direction.",
                                risks: groupedRisks.stable,
                                color: "text-[#5d6f9a]",
                                symbol: "→",
                            },
                            {
                                key: "decreasing",
                                title: "Decreasing Risks",
                                subtitle:
                                    "Patterns showing a decreasing direction.",
                                risks: groupedRisks.decreasing,
                                color: "text-[#087542]",
                                symbol: "↓",
                            },
                            {
                                key: "other",
                                title: "Direction Not Stated",
                                subtitle:
                                    "Patterns without a stored direction.",
                                risks: groupedRisks.other,
                                color: "text-[#718078]",
                                symbol: "—",
                            },
                        ].map((group) => {
                            if (group.risks.length === 0) return null;

                            return (
                                <section key={group.key}>
                                    <div className="mb-3 flex items-center gap-3">
                                        <span
                                            className={`text-[18px] font-extrabold ${group.color}`}
                                        >
                                            {group.symbol}
                                        </span>

                                        <div>
                                            <h3 className="text-[#17211b] text-[13px] font-extrabold">
                                                {group.title}
                                            </h3>
                                            <p className="mt-0.5 text-[#8a958e] text-[9px]">
                                                {group.subtitle}
                                            </p>
                                        </div>

                                        <span className="ml-auto min-w-[24px] h-6 px-2 flex items-center justify-center rounded-full bg-[#edf3ef] text-[#087542] text-[9px] font-extrabold">
                                            {group.risks.length}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2.5 max-w-none">
                                        {group.risks.map(renderRiskCard)}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>

            <p className="mt-6 text-[#8a958e] text-[9px] leading-[1.6]">
                The selected period filters the report activity and the risk
                patterns shown below. Direction labels are the stored
                intelligence result; this view does not forecast future
                incidents.
            </p>
        </div>
    );
}

export default RiskTrends;
