import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import {
    getDashboardOverview,
    getDistressRanking,
} from "../../api/dashboard.api";

const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

function Dashboard() {
    const navigate = useNavigate();

    const [overview, setOverview] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);



    const [trends, setTrends] = useState({
        most_common_problems: [],
        most_active_sites: [],
    });

    const [timeMetrics, setTimeMetrics] = useState({
        cases_solved_this_month: 0,
        total_incidents_this_year: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* =========================================================
       DASHBOARD DATA
    ========================================================= */

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    overviewResponse,
                    rankingResponse,
                    trendsResponse,
                    timeMetricsResponse,
                ] = await Promise.all([
                    getDashboardOverview(),
                    getDistressRanking(),

                    fetch(
                        `${API_BASE_URL}/dashboard/trends`
                    ).then(async (response) => {
                        if (!response.ok) {
                            throw new Error(
                                "Failed to fetch dashboard trends"
                            );
                        }

                        return response.json();
                    }),

                    fetch(
                        `${API_BASE_URL}/dashboard/time-metrics`
                    ).then(async (response) => {
                        if (!response.ok) {
                            throw new Error(
                                "Failed to fetch dashboard time metrics"
                            );
                        }

                        return response.json();
                    }),
                ]);

                /* ---------------- OVERVIEW ---------------- */

                setOverview(
                    overviewResponse?.data || {}
                );

                /* ---------------- RANKING ---------------- */

                setRanking(
                    rankingResponse?.data || []
                );

                /* ---------------- TRENDS ---------------- */

                setTrends(
                    trendsResponse?.data || {
                        most_common_problems: [],
                        most_active_sites: [],
                    }
                );

                /* ---------------- TIME METRICS ---------------- */

                setTimeMetrics(
                    timeMetricsResponse?.data || {
                        cases_solved_this_month: 0,
                        total_incidents_this_year: 0,
                    }
                );
            } catch (err) {
                console.error(
                    "Dashboard loading error:",
                    err
                );

                setError(
                    "Unable to load safety intelligence data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    /* =========================================================
       LOADING
    ========================================================= */

    if (loading) {
        return (
            <div
                className="
                    min-h-screen

                    flex
                    flex-col
                    items-center
                    justify-center

                    bg-[#f5f8f6]

                    text-[#17211b]
                "
            >
                <div
                    className="
                        w-10
                        h-10

                        border-4
                        border-[#dce8e0]
                        border-t-[#087542]

                        rounded-full

                        animate-spin
                    "
                />

                <p
                    className="
                        mt-5

                        text-[#718078]

                        text-[13px]
                        font-medium
                    "
                >
                    Loading safety intelligence...
                </p>
            </div>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (error) {
        return (
            <div
                className="
                    min-h-screen

                    flex
                    flex-col
                    items-center
                    justify-center

                    px-6

                    bg-[#f5f8f6]

                    text-center
                "
            >
                <div
                    className="
                        w-12
                        h-12

                        flex
                        items-center
                        justify-center

                        rounded-full

                        bg-[#fff0f0]

                        text-[#c62828]

                        text-[20px]
                        font-extrabold
                    "
                >
                    !
                </div>

                <h2
                    className="
                        mt-5

                        text-[#17211b]

                        text-[24px]
                        font-extrabold
                    "
                >
                    Dashboard unavailable
                </h2>

                <p
                    className="
                        max-w-[420px]

                        mt-2

                        text-[#718078]

                        text-[13px]
                        leading-[1.6]
                    "
                >
                    {error}
                </p>

                <button
                    onClick={() =>
                        window.location.reload()
                    }
                    className="
                        mt-6

                        px-6
                        py-3

                        border
                        border-[#087542]

                        rounded-[3px]

                        bg-transparent

                        text-[#087542]

                        text-[12px]
                        font-bold

                        cursor-pointer

                        transition

                        hover:bg-[#087542]
                        hover:text-white
                    "
                >
                    Try Again
                </button>
            </div>
        );
    }

    /* =========================================================
       DERIVED DATA
    ========================================================= */

    const commonProblems =
        trends?.most_common_problems || [];

    const activeSites =
        trends?.most_active_sites || [];

    const solvedThisMonth =
        timeMetrics?.cases_solved_this_month ?? 0;

    const incidentsThisYear =
        timeMetrics?.total_incidents_this_year ?? 0;

    const activeCases = ranking.filter(
        (report) => report.case_status === "active" || "assigned"
    ).length;

    const assignedCases =
        overview?.cases?.assigned ?? 0;

    const resolvedCases =
        overview?.cases?.resolved ?? 0;

    const totalReports =
        overview?.reports?.total ?? 0;

    const approvedReports =
        overview?.reports?.approved ?? 0;

    const highestPriority =
        ranking?.[0]?.sif_score ?? "—";

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <div className="min-h-screen bg-[#f5f8f6] text-[#17211b]">

            <Navbar />

            <main id="dashboard">

                {/* =================================================
                    HERO
                ================================================= */}

                <section
                    className="
                        relative

                        min-h-[590px]

                        overflow-hidden

                        grid
                        grid-cols-1
                        lg:grid-cols-[1.35fr_0.65fr]

                        text-white

                        bg-gradient-to-br
                        from-[#062d1d]
                        via-[#075b39]
                        to-[#0b7548]

                        border-b
                        border-[#0c5f3b]
                    "
                >

                    {/* Background grid */}

                    <div
                        className="
                            pointer-events-none

                            absolute
                            inset-0

                            opacity-[0.035]

                            bg-[linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px)]

                            bg-[size:55px_55px]

                            [mask-image:linear-gradient(to_right,black,transparent_80%)]
                        "
                    />

                    {/* Hero content */}

                    <div
                        className="
                            relative
                            z-10

                            flex
                            flex-col
                            justify-center

                            px-[6%]
                            py-20

                            lg:px-[clamp(45px,8vw,130px)]
                            lg:py-[90px]
                        "
                    >

                        <div
                            className="
                                mb-[15px]

                                text-[#8fd3ad]

                                text-[10px]
                                font-extrabold

                                tracking-[0.2em]
                            "
                        >
                            OIL SIF / LIVE SAFETY OVERVIEW
                        </div>

                        <h1
                            className="
                                max-w-[850px]

                                text-white

                                text-[clamp(50px,6vw,84px)]
                                leading-[0.92]

                                font-extrabold

                                tracking-[-0.065em]
                            "
                        >
                            Operational safety,
                            <br />
                            at a glance.
                        </h1>

                        <p
                            className="
                                max-w-[620px]

                                mt-7

                                text-white/70

                                text-[16px]
                                leading-[1.7]
                            "
                        >
                            A live view of active safety
                            cases, operational distress
                            and emerging risk across the
                            organization.
                        </p>

                        <div
                            className="
                                mt-9

                                flex
                                flex-col
                                items-start

                                gap-5

                                sm:flex-row
                                sm:items-center
                                sm:gap-[26px]
                            "
                        >

                            <button
                                className="
                                    inline-flex
                                    items-center
                                    justify-between
                                    gap-7

                                    px-[21px]
                                    py-[15px]

                                    rounded-[2px]
                                    border-0

                                    bg-white
                                    text-[#075b39]

                                    text-[13px]
                                    font-extrabold

                                    cursor-pointer

                                    transition

                                    hover:-translate-y-0.5
                                    hover:bg-[#edf7f1]
                                "
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "distress-ranking"
                                        )
                                        ?.scrollIntoView({
                                            behavior:
                                                "smooth",
                                        })
                                }
                            >
                                View distress ranking

                                <span className="text-[20px]">
                                    →
                                </span>
                            </button>

                            <button
                                className="
                                    px-0
                                    py-[5px]

                                    border-0
                                    bg-transparent

                                    text-white

                                    text-[13px]
                                    font-bold

                                    cursor-pointer

                                    opacity-90

                                    hover:opacity-100
                                    hover:underline
                                "
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "statistics"
                                        )
                                        ?.scrollIntoView({
                                            behavior:
                                                "smooth",
                                        })
                                }
                            >
                                Explore statistics
                            </button>

                        </div>
                    </div>

                    {/* Glass status panel */}

                    <div
                        className="
                            relative
                            z-10

                            flex
                            flex-col
                            justify-center

                            mx-[6%]
                            mb-[6%]

                            p-[30px]

                            rounded-[4px]

                            border
                            border-white/15

                            bg-gradient-to-br
                            from-white/[0.13]
                            to-white/[0.045]

                            shadow-[0_25px_80px_rgba(0,25,15,0.22)]

                            backdrop-blur-[18px]

                            lg:my-[42px]
                            lg:mr-[42px]
                            lg:ml-0

                            lg:p-[42px]
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                justify-between

                                text-white/60

                                text-[9px]
                                font-extrabold

                                tracking-[0.14em]
                            "
                        >
                            <span>
                                LIVE SAFETY STATUS
                            </span>

                            <span
                                className="
                                    flex
                                    items-center
                                    gap-[7px]

                                    text-[#a6e4c1]

                                    text-[10px]
                                    tracking-normal
                                "
                            >
                                <i
                                    className="
                                        block

                                        w-[7px]
                                        h-[7px]

                                        rounded-full

                                        bg-[#32c77d]

                                        shadow-[0_0_12px_rgba(50,199,125,0.8)]
                                    "
                                />

                                Operational
                            </span>
                        </div>

                        <div
                            className="
                                mt-11
                                lg:mt-[62px]
                            "
                        >
                            <span
                                className="
                                    block

                                    text-white/60

                                    text-[12px]
                                    font-extrabold

                                    tracking-[0.15em]
                                "
                            >
                                ACTIVE CASES
                            </span>

                            <strong
                                className="
                                    block

                                    mt-2

                                    text-white

                                    text-[clamp(95px,10vw,145px)]
                                    leading-[0.78]

                                    font-extrabold

                                    tracking-[-0.09em]
                                "
                            >
                                {String(activeCases).padStart(
                                    2,
                                    "0"
                                )}
                            </strong>

                            <p
                                className="
                                    max-w-[230px]

                                    mt-7

                                    text-white/65

                                    text-[13px]
                                    leading-[1.6]
                                "
                            >
                                Cases currently requiring
                                attention
                            </p>
                        </div>

                        <div
                            className="
                                w-full
                                h-px

                                my-[30px]

                                bg-white/15

                                lg:my-[45px]
                            "
                        />

                        <div
                            className="
                                flex
                                items-end
                                justify-between
                            "
                        >
                            <div>
                                <span
                                    className="
                                        block

                                        text-white/60

                                        text-[9px]
                                        font-extrabold

                                        tracking-[0.15em]
                                    "
                                >
                                    HIGHEST PRIORITY
                                </span>

                                <strong
                                    className="
                                        block

                                        mt-2

                                        text-white

                                        text-[34px]
                                        leading-none

                                        font-extrabold

                                        tracking-[-0.04em]
                                    "
                                >
                                    {highestPriority}
                                </strong>
                            </div>

                            <span
                                className="
                                    text-[#9fe0bb]

                                    text-[29px]
                                "
                            >
                                →
                            </span>
                        </div>

                    </div>
                </section>


                {/* =================================================
                    DISTRESS RANKING
                ================================================= */}

                <section
                    id="distress-ranking"
                    className="
                        w-[90%]
                        max-w-[1380px]

                        mx-auto

                        py-[105px]
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            items-start

                            gap-8
                            mb-10

                            md:flex-row
                            md:items-end
                            md:justify-between
                        "
                    >
                        <div>
                            <div
                                className="
                                    mb-[10px]

                                    text-[#087542]

                                    text-[10px]
                                    font-extrabold

                                    tracking-[0.2em]
                                "
                            >
                                PRIORITY MONITOR
                            </div>

                            <h2
                                className="
                                    text-[#17211b]

                                    text-[clamp(36px,4vw,52px)]
                                    leading-none

                                    font-extrabold

                                    tracking-[-0.055em]
                                "
                            >
                                Distress Ranking
                            </h2>

                            <p
                                className="
                                    max-w-[600px]

                                    mt-4

                                    text-[#718078]

                                    text-[14px]
                                    leading-[1.7]
                                "
                            >
                                Active and assigned cases
                                ranked by safety distress.
                            </p>
                        </div>

                        <div
                            className="
                                flex
                                flex-col
                                items-start

                                md:items-end
                            "
                        >
                            <strong
                                className="
                                    text-[#17211b]

                                    text-[42px]
                                    leading-none

                                    font-extrabold

                                    tracking-[-0.05em]
                                "
                            >
                                {String(
                                    ranking.length
                                ).padStart(2, "0")}
                            </strong>

                            <span
                                className="
                                    mt-2

                                    text-[#718078]

                                    text-[9px]
                                    font-extrabold

                                    tracking-[0.13em]
                                "
                            >
                                ACTIVE CASES
                            </span>
                        </div>
                    </div>


                    <div
                        className="
                            overflow-hidden

                            border
                            border-[#d9e2dc]

                            rounded-[5px]

                            bg-white

                            shadow-[0_8px_25px_rgba(20,50,35,0.04)]
                        "
                    >

                        {/* Desktop table header */}

                        <div
                            className="
                                hidden

                                lg:grid
                                lg:grid-cols-[70px_1.5fr_1fr_150px_100px_40px]

                                px-6
                                py-4

                                border-b
                                border-[#dce3dd]

                                bg-[#f7faf8]

                                text-[#718078]

                                text-[9px]
                                font-extrabold

                                tracking-[0.14em]
                            "
                        >
                            <span>RANK</span>
                            <span>CASE</span>
                            <span>LOCATION</span>
                            <span>STATUS</span>
                            <span>SCORE</span>
                            <span />
                        </div>


                        {ranking.length === 0 ? (
                            <div
                                className="
                                    min-h-[220px]

                                    flex
                                    items-center
                                    justify-center

                                    gap-5

                                    px-8
                                "
                            >
                                <span
                                    className="
                                        w-11
                                        h-11

                                        flex
                                        items-center
                                        justify-center

                                        shrink-0

                                        rounded-full

                                        bg-[#e9f5ee]

                                        text-[#087542]

                                        text-[18px]
                                        font-bold
                                    "
                                >
                                    ✓
                                </span>

                                <div>
                                    <strong
                                        className="
                                            block

                                            text-[#17211b]

                                            text-[15px]
                                            font-extrabold
                                        "
                                    >
                                        No active safety
                                        cases
                                    </strong>

                                    <p
                                        className="
                                            mt-1

                                            text-[#718078]

                                            text-[12px]
                                        "
                                    >
                                        There are currently
                                        no cases requiring
                                        attention.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            ranking.map(
                                (report, index) => (
                                    <button
                                        key={
                                            report.report_id ||
                                            report._id
                                        }
                                        className="
                                            w-full

                                            grid
                                            grid-cols-1

                                            gap-4

                                            px-6
                                            py-5

                                            border-0
                                            border-b
                                            border-[#edf1ee]

                                            bg-white

                                            text-left

                                            cursor-pointer

                                            transition

                                            hover:bg-[#f7faf8]

                                            lg:grid-cols-[70px_1.5fr_1fr_150px_100px_40px]
                                            lg:items-center
                                            lg:gap-0
                                        "
                                        onClick={() => setSelectedCase(report)}
                                    >
                                        <span
                                            className="
                                                text-[#087542]

                                                text-[12px]
                                                font-extrabold
                                            "
                                        >
                                            {String(
                                                index + 1
                                            ).padStart(2, "0")}
                                        </span>

                                        <span className="flex flex-col">
                                            <strong
                                                className="
                                                    text-[#17211b]

                                                    text-[14px]
                                                    font-bold
                                                "
                                            >
                                                {report.activity ||
                                                    "Safety incident"}
                                            </strong>

                                            <small
                                                className="
                                                    mt-1

                                                    text-[#8a958e]

                                                    text-[10px]
                                                "
                                            >
                                                {
                                                    report.report_id
                                                }
                                            </small>
                                        </span>

                                        <span
                                            className="
                                                text-[#59655e]

                                                text-[12px]
                                                font-medium
                                            "
                                        >
                                            {report.location ||
                                                report.site ||
                                                "—"}
                                        </span>

                                        <span>
                                            <span
                                                className={`
                                                    inline-flex

                                                    px-3
                                                    py-[6px]

                                                    rounded-full

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.08em]

                                                    ${report.case_status ===
                                                        "assigned"
                                                        ? "bg-[#edf2ff] text-[#3157a5]"
                                                        : "bg-[#fff1f1] text-[#c62828]"
                                                    }
                                                `}
                                            >
                                                {report.case_status ||
                                                    "active"}
                                            </span>
                                        </span>

                                        <span
                                            className="
                                                text-[#17211b]

                                                text-[16px]
                                                font-extrabold
                                            "
                                        >
                                            {report.sif_score ??
                                                "—"}
                                        </span>

                                        <span
                                            className="
                                                hidden

                                                lg:block

                                                text-[#087542]

                                                text-[20px]
                                            "
                                        >
                                            →
                                        </span>
                                    </button>
                                )
                            )
                        )}

                    </div>
                </section>


                {/* =================================================
                    STATISTICS
                ================================================= */}

                <section
                    id="statistics"
                    className="
                        w-[90%]
                        max-w-[1380px]

                        mx-auto

                        py-[105px]
                    "
                >

                    <div className="mb-10">

                        <div
                            className="
                                mb-[10px]

                                text-[#087542]

                                text-[10px]
                                font-extrabold

                                tracking-[0.2em]
                            "
                        >
                            ORGANIZATIONAL OVERVIEW
                        </div>

                        <h2
                            className="
                                text-[#17211b]

                                text-[clamp(36px,4vw,52px)]
                                leading-none

                                font-extrabold

                                tracking-[-0.055em]
                            "
                        >
                            Safety Statistics
                        </h2>

                        <p
                            className="
                                max-w-[600px]

                                mt-4

                                text-[#718078]

                                text-[14px]
                                leading-[1.7]
                            "
                        >
                            A high-level view of safety
                            activity and operational
                            patterns.
                        </p>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1

                            gap-4

                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                    >

                        {/* Common problem */}

                        <div
                            className="
                                min-h-[205px]

                                flex
                                flex-col
                                justify-between

                                p-7

                                rounded-[6px]

                                border
                                border-[#d9e2dc]

                                bg-white

                                shadow-[0_8px_25px_rgba(20,50,35,0.055)]

                                transition

                                hover:-translate-y-1
                                hover:shadow-[0_18px_35px_rgba(20,50,35,0.1)]
                            "
                        >
                            <span
                                className="
                                    text-[#718078]

                                    text-[9px]
                                    font-extrabold

                                    tracking-[0.13em]
                                "
                            >
                                MOST COMMON PROBLEM
                            </span>

                            <strong
                                className="
                                    mt-8

                                    text-[#17211b]

                                    text-[28px]
                                    leading-[1.05]

                                    font-extrabold
                                "
                            >
                                {commonProblems[0]
                                    ?.activity || "—"}
                            </strong>

                            <p
                                className="
                                    mt-3

                                    text-[#77827b]

                                    text-[11px]
                                "
                            >
                                {commonProblems[0]
                                    ?.frequency ?? 0}{" "}
                                reported cases
                            </p>
                        </div>


                        {/* Active site */}

                        <div
                            className="
                                min-h-[205px]

                                flex
                                flex-col
                                justify-between

                                p-7

                                rounded-[6px]

                                border
                                border-[#d9e2dc]

                                bg-white

                                shadow-[0_8px_25px_rgba(20,50,35,0.055)]

                                transition

                                hover:-translate-y-1
                                hover:shadow-[0_18px_35px_rgba(20,50,35,0.1)]
                            "
                        >
                            <span
                                className="
                                    text-[#718078]

                                    text-[9px]
                                    font-extrabold

                                    tracking-[0.13em]
                                "
                            >
                                MOST ACTIVE SITE
                            </span>

                            <strong
                                className="
                                    mt-8

                                    text-[#17211b]

                                    text-[28px]
                                    leading-[1.05]

                                    font-extrabold
                                "
                            >
                                {activeSites[0]
                                    ?.site || "—"}
                            </strong>

                            <p
                                className="
                                    mt-3

                                    text-[#77827b]

                                    text-[11px]
                                "
                            >
                                {activeSites[0]
                                    ?.frequency ?? 0}{" "}
                                reported cases
                            </p>
                        </div>


                        {/* Solved */}

                        <div
                            className="
                                min-h-[205px]

                                flex
                                flex-col
                                justify-between

                                p-7

                                rounded-[6px]

                                border
                                border-[#d9e2dc]

                                bg-white

                                shadow-[0_8px_25px_rgba(20,50,35,0.055)]

                                transition

                                hover:-translate-y-1
                                hover:shadow-[0_18px_35px_rgba(20,50,35,0.1)]
                            "
                        >
                            <span
                                className="
                                    text-[#718078]

                                    text-[9px]
                                    font-extrabold

                                    tracking-[0.13em]
                                "
                            >
                                CASES SOLVED THIS MONTH
                            </span>

                            <strong
                                className="
                                    mt-8

                                    text-[#17211b]

                                    text-[52px]
                                    leading-none

                                    font-extrabold

                                    tracking-[-0.06em]
                                "
                            >
                                {solvedThisMonth}
                            </strong>

                            <p
                                className="
                                    mt-3

                                    text-[#77827b]

                                    text-[11px]
                                "
                            >
                                Resolved approved cases
                            </p>
                        </div>


                        {/* Total incidents */}

                        <div
                            className="
                                min-h-[205px]

                                flex
                                flex-col
                                justify-between

                                p-7

                                rounded-[6px]

                                border
                                border-[#075b39]

                                bg-gradient-to-br
                                from-[#06482d]
                                to-[#087542]

                                text-white

                                shadow-[0_12px_30px_rgba(5,65,40,0.18)]

                                transition

                                hover:-translate-y-1
                            "
                        >
                            <span
                                className="
                                    text-white/65

                                    text-[9px]
                                    font-extrabold

                                    tracking-[0.13em]
                                "
                            >
                                TOTAL INCIDENTS THIS YEAR
                            </span>

                            <strong
                                className="
                                    mt-8

                                    text-white

                                    text-[52px]
                                    leading-none

                                    font-extrabold

                                    tracking-[-0.06em]
                                "
                            >
                                {incidentsThisYear}
                            </strong>

                            <p
                                className="
                                    mt-3

                                    text-white/65

                                    text-[11px]
                                "
                            >
                                Approved incidents
                                recorded
                            </p>
                        </div>

                    </div>
                </section>


                {/* =================================================
                    ANALYTICS
                ================================================= */}

                <section
                    className="
                        w-[90%]
                        max-w-[1380px]

                        mx-auto

                        pb-[105px]
                    "
                >

                    <div className="mb-10">

                        <div
                            className="
                                mb-[10px]

                                text-[#087542]

                                text-[10px]
                                font-extrabold

                                tracking-[0.2em]
                            "
                        >
                            OPERATIONAL ANALYTICS
                        </div>

                        <h2
                            className="
                                text-[#17211b]

                                text-[clamp(36px,4vw,52px)]
                                leading-none

                                font-extrabold

                                tracking-[-0.055em]
                            "
                        >
                            Emerging patterns
                        </h2>

                        <p
                            className="
                                max-w-[600px]

                                mt-4

                                text-[#718078]

                                text-[14px]
                                leading-[1.7]
                            "
                        >
                            The areas and locations
                            contributing most to reported
                            safety activity.
                        </p>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1

                            gap-5

                            lg:grid-cols-2
                        "
                    >

                        {/* Common problems */}

                        <div
                            className="
                                p-7

                                rounded-[6px]

                                border
                                border-[#d9e2dc]

                                bg-white

                                shadow-[0_8px_25px_rgba(20,50,35,0.04)]
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between

                                    mb-7
                                "
                            >
                                <strong
                                    className="
                                        text-[#17211b]

                                        text-[14px]
                                        font-extrabold
                                    "
                                >
                                    Most common problems
                                </strong>

                                <span
                                    className="
                                        text-[#087542]

                                        text-[9px]
                                        font-extrabold

                                        tracking-[0.12em]
                                    "
                                >
                                    TOP 5
                                </span>
                            </div>


                            <div className="space-y-5">

                                {commonProblems.length ===
                                    0 ? (
                                    <p
                                        className="
                                            text-[#8a958e]

                                            text-[12px]
                                        "
                                    >
                                        No trend data
                                        available.
                                    </p>
                                ) : (
                                    commonProblems.map(
                                        (
                                            problem,
                                            index
                                        ) => {
                                            const max =
                                                commonProblems[0]
                                                    ?.frequency ||
                                                1;

                                            const width =
                                                Math.max(
                                                    8,
                                                    (problem.frequency /
                                                        max) *
                                                    100
                                                );

                                            return (
                                                <div
                                                    key={`${problem.activity}-${index}`}
                                                >
                                                    <div
                                                        className="
                                                            flex
                                                            justify-between
                                                            gap-4

                                                            mb-2
                                                        "
                                                    >
                                                        <span
                                                            className="
                                                                text-[#46534b]

                                                                text-[12px]
                                                                font-semibold
                                                            "
                                                        >
                                                            {
                                                                problem.activity
                                                            }
                                                        </span>

                                                        <span
                                                            className="
                                                                text-[#087542]

                                                                text-[11px]
                                                                font-bold
                                                            "
                                                        >
                                                            {
                                                                problem.frequency
                                                            }
                                                        </span>
                                                    </div>

                                                    <div
                                                        className="
                                                            h-[6px]

                                                            overflow-hidden

                                                            rounded-full

                                                            bg-[#e8efea]
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                h-full

                                                                rounded-full

                                                                bg-[#087542]

                                                                transition-all
                                                            "
                                                            style={{
                                                                width: `${width}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )
                                )}

                            </div>
                        </div>


                        {/* Active sites */}

                        <div
                            className="
                                p-7

                                rounded-[6px]

                                border
                                border-[#d9e2dc]

                                bg-white

                                shadow-[0_8px_25px_rgba(20,50,35,0.04)]
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between

                                    mb-7
                                "
                            >
                                <strong
                                    className="
                                        text-[#17211b]

                                        text-[14px]
                                        font-extrabold
                                    "
                                >
                                    Most active sites
                                </strong>

                                <span
                                    className="
                                        text-[#087542]

                                        text-[9px]
                                        font-extrabold

                                        tracking-[0.12em]
                                    "
                                >
                                    TOP 5
                                </span>
                            </div>


                            <div className="space-y-5">

                                {activeSites.length ===
                                    0 ? (
                                    <p
                                        className="
                                            text-[#8a958e]

                                            text-[12px]
                                        "
                                    >
                                        No site data
                                        available.
                                    </p>
                                ) : (
                                    activeSites.map(
                                        (
                                            site,
                                            index
                                        ) => {
                                            const max =
                                                activeSites[0]
                                                    ?.frequency ||
                                                1;

                                            const width =
                                                Math.max(
                                                    8,
                                                    (site.frequency /
                                                        max) *
                                                    100
                                                );

                                            return (
                                                <div
                                                    key={`${site.site}-${index}`}
                                                >
                                                    <div
                                                        className="
                                                            flex
                                                            justify-between
                                                            gap-4

                                                            mb-2
                                                        "
                                                    >
                                                        <span
                                                            className="
                                                                text-[#46534b]

                                                                text-[12px]
                                                                font-semibold
                                                            "
                                                        >
                                                            {site.site ||
                                                                "Unknown site"}
                                                        </span>

                                                        <span
                                                            className="
                                                                text-[#087542]

                                                                text-[11px]
                                                                font-bold
                                                            "
                                                        >
                                                            {
                                                                site.frequency
                                                            }
                                                        </span>
                                                    </div>

                                                    <div
                                                        className="
                                                            h-[6px]

                                                            overflow-hidden

                                                            rounded-full

                                                            bg-[#e8efea]
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                h-full

                                                                rounded-full

                                                                bg-[#087542]

                                                                transition-all
                                                            "
                                                            style={{
                                                                width: `${width}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )
                                )}

                            </div>
                        </div>

                    </div>


                    {/* Case overview cards */}

                    <div
                        className="
        mt-5
        grid
        grid-cols-1
        sm:grid-cols-3
        gap-5
    "
                    >
                        <div
                            className="
            p-7
            rounded-[6px]
            border
            border-[#d9e2dc]
            bg-white
            shadow-[0_8px_25px_rgba(20,50,35,0.04)]
        "
                        >
                            <span
                                className="
                text-[#718078]
                text-[9px]
                font-extrabold
                tracking-[0.13em]
            "
                            >
                                ACTIVE
                            </span>

                            <strong
                                className="
                block
                mt-3
                text-[#17211b]
                text-[38px]
                leading-none
                font-extrabold
            "
                            >
                                {activeCases}
                            </strong>

                            <p
                                className="
                mt-3
                text-[#718078]
                text-[12px]
            "
                            >
                                Cases currently active
                            </p>
                        </div>


                        <div
                            className="
            p-7
            rounded-[6px]
            border
            border-[#d9e2dc]
            bg-white
            shadow-[0_8px_25px_rgba(20,50,35,0.04)]
        "
                        >
                            <span
                                className="
                text-[#718078]
                text-[9px]
                font-extrabold
                tracking-[0.13em]
            "
                            >
                                ASSIGNED
                            </span>

                            <strong
                                className="
                block
                mt-3
                text-[#17211b]
                text-[38px]
                leading-none
                font-extrabold
            "
                            >
                                {assignedCases}
                            </strong>

                            <p
                                className="
                mt-3
                text-[#718078]
                text-[12px]
            "
                            >
                                Cases assigned to teams
                            </p>
                        </div>


                        <div
                            className="
            p-7
            rounded-[6px]
            border
            border-[#d9e2dc]
            bg-white
            shadow-[0_8px_25px_rgba(20,50,35,0.04)]
        "
                        >
                            <span
                                className="
                text-[#718078]
                text-[9px]
                font-extrabold
                tracking-[0.13em]
            "
                            >
                                RESOLVED
                            </span>

                            <strong
                                className="
                block
                mt-3
                text-[#087542]
                text-[38px]
                leading-none
                font-extrabold
            "
                            >
                                {resolvedCases}
                            </strong>

                            <p
                                className="
                mt-3
                text-[#718078]
                text-[12px]
            "
                            >
                                Cases successfully resolved
                            </p>
                        </div>
                    </div>


                </section>


                {/* =================================================
                    REPORT CTA
                ================================================= */}

                <section
                    id="report"
                    className="
                        relative
                        overflow-hidden

                        w-[90%]
                        max-w-[1380px]

                        mx-auto
                        mb-[80px]

                        px-[7%]
                        py-[65px]

                        flex
                        flex-col

                        gap-8

                        rounded-[6px]

                        bg-gradient-to-br
                        from-[#062d1d]
                        to-[#087542]

                        text-white

                        shadow-[0_20px_50px_rgba(5,65,40,0.15)]

                        md:flex-row
                        md:items-center
                        md:justify-between
                    "
                >

                    <div
                        className="
                            pointer-events-none

                            absolute
                            right-[-100px]
                            top-[-100px]

                            w-[300px]
                            h-[300px]

                            rounded-full

                            border
                            border-white/10
                        "
                    />

                    <div className="relative z-10">

                        <div
                            className="
                                mb-3

                                text-[#9fe0bb]

                                text-[10px]
                                font-extrabold

                                tracking-[0.2em]
                            "
                        >
                            SAFETY FIRST
                        </div>

                        <h2
                            className="
                                text-white

                                text-[clamp(28px,4vw,46px)]
                                leading-none

                                font-extrabold

                                tracking-[-0.05em]
                            "
                        >
                            Observed a safety concern?
                        </h2>

                        <p
                            className="
                                max-w-[560px]

                                mt-4

                                text-white/65

                                text-[13px]
                                leading-[1.7]
                            "
                        >
                            Submit a problem report for
                            administrative review and
                            assessment.
                        </p>

                    </div>


                    <button
                        className="
                            relative
                            z-10

                            shrink-0

                            inline-flex
                            items-center
                            justify-center
                            gap-7

                            px-6
                            py-4

                            rounded-[3px]
                            border-0

                            bg-white

                            text-[#075b39]

                            text-[12px]
                            font-extrabold

                            cursor-pointer

                            transition

                            hover:-translate-y-1
                            hover:bg-[#edf7f1]
                        "
                        onClick={() =>
                            navigate(
                                "/report"
                            )
                        }
                    >
                        Submit a report

                        <span className="text-[18px]">
                            →
                        </span>
                    </button>

                </section>

            </main>
            {/* CASE DETAILS MODAL */}

            {selectedCase && (
                <div
                    className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-[#17211b]/60
            px-4
            py-6
        "
                    onClick={() => setSelectedCase(null)}
                >
                    <div
                        className="
                w-full
                max-w-[900px]
                max-h-[92vh]
                overflow-y-auto
                rounded-[6px]
                border
                border-[#d9e2dc]
                bg-white
                shadow-[0_30px_90px_rgba(20,50,35,0.28)]
            "
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* Header */}

                        <div
                            className="
                    sticky
                    top-0
                    z-10
                    flex
                    items-start
                    justify-between
                    gap-6
                    px-7
                    py-6
                    border-b
                    border-[#e3e9e5]
                    bg-white
                "
                        >
                            <div>
                                <span
                                    className="
                            block
                            mb-2
                            text-[#087542]
                            text-[9px]
                            font-extrabold
                            tracking-[0.18em]
                        "
                                >
                                    SAFETY CASE
                                </span>

                                <h2
                                    className="
                            text-[#17211b]
                            text-[27px]
                            font-extrabold
                            tracking-[-0.04em]
                        "
                                >
                                    {selectedCase.activity ||
                                        selectedCase.scenario_family ||
                                        "Safety incident"}
                                </h2>

                                <div
                                    className="
                            flex
                            flex-wrap
                            items-center
                            gap-3
                            mt-2
                        "
                                >
                                    <span
                                        className="
                                text-[#8a958e]
                                text-[11px]
                            "
                                    >
                                        {selectedCase.report_id}
                                    </span>

                                    {selectedCase.site && (
                                        <>
                                            <span className="text-[#c2cbc5]">
                                                •
                                            </span>

                                            <span
                                                className="
                                        text-[#59655e]
                                        text-[11px]
                                    "
                                            >
                                                {selectedCase.site}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedCase(null)}
                                className="
                        w-10
                        h-10
                        shrink-0
                        flex
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#dce5df]
                        bg-white
                        text-[#718078]
                        text-[18px]
                        cursor-pointer
                        transition
                        hover:bg-[#f5f8f6]
                        hover:text-[#17211b]
                    "
                            >
                                ×
                            </button>
                        </div>

                        <div className="px-7 py-7">

                            {/* Summary cards */}

                            <div
                                className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                            >
                                <div
                                    className="
                            p-5
                            rounded-[5px]
                            border
                            border-[#dce5df]
                            bg-[#f7faf8]
                        "
                                >
                                    <span
                                        className="
                                block
                                mb-2
                                text-[#718078]
                                text-[9px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                                    >
                                        LOCATION
                                    </span>

                                    <strong
                                        className="
                                text-[#17211b]
                                text-[14px]
                                font-bold
                            "
                                    >
                                        {selectedCase.location ||
                                            selectedCase.site ||
                                            "—"}
                                    </strong>
                                </div>

                                <div
                                    className="
                            p-5
                            rounded-[5px]
                            border
                            border-[#dce5df]
                            bg-[#f7faf8]
                        "
                                >
                                    <span
                                        className="
                                block
                                mb-2
                                text-[#718078]
                                text-[9px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                                    >
                                        SIF SCORE
                                    </span>

                                    <strong
                                        className="
                                text-[#087542]
                                text-[22px]
                                font-extrabold
                            "
                                    >
                                        {selectedCase.sif_score ?? "—"}
                                    </strong>
                                </div>

                                <div
                                    className="
                            p-5
                            rounded-[5px]
                            border
                            border-[#dce5df]
                            bg-[#f7faf8]
                        "
                                >
                                    <span
                                        className="
                                block
                                mb-2
                                text-[#718078]
                                text-[9px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                                    >
                                        SIF LEVEL
                                    </span>

                                    <strong
                                        className="
                                text-[#17211b]
                                text-[14px]
                                font-bold
                            "
                                    >
                                        {selectedCase.sif_level || "—"}
                                    </strong>
                                </div>

                                <div
                                    className="
                            p-5
                            rounded-[5px]
                            border
                            border-[#dce5df]
                            bg-[#f7faf8]
                        "
                                >
                                    <span
                                        className="
                                block
                                mb-2
                                text-[#718078]
                                text-[9px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                                    >
                                        STATUS
                                    </span>

                                    <strong
                                        className="
                                text-[#17211b]
                                text-[14px]
                                font-bold
                                capitalize
                            "
                                    >
                                        {selectedCase.case_status || "active"}
                                    </strong>
                                </div>
                            </div>

                            {/* Incident description */}

                            <div className="mt-7">

                                <span
                                    className="
                            block
                            mb-3
                            text-[#718078]
                            text-[9px]
                            font-extrabold
                            tracking-[0.13em]
                        "
                                >
                                    INCIDENT DESCRIPTION
                                </span>

                                <div
                                    className="
                            p-5
                            rounded-[5px]
                            border
                            border-[#dce5df]
                            bg-white
                            text-[#46534b]
                            text-[13px]
                            leading-[1.75]
                        "
                                >
                                    {selectedCase.report_text ||
                                        "No incident description available."}
                                </div>
                            </div>

                            {/* Incident information */}

                            <div className="mt-7">

                                <span
                                    className="
                            block
                            mb-3
                            text-[#718078]
                            text-[9px]
                            font-extrabold
                            tracking-[0.13em]
                        "
                                >
                                    INCIDENT INFORMATION
                                </span>

                                <div
                                    className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                        "
                                >
                                    {[
                                        ["SITE", selectedCase.site],
                                        ["ACTIVITY", selectedCase.activity],
                                        ["LOCATION", selectedCase.location],
                                        ["EQUIPMENT", selectedCase.equipment],
                                        ["HAZARD", selectedCase.hazard],
                                        ["ENERGY SOURCE", selectedCase.energy_source],
                                        ["EXPOSURE", selectedCase.exposure],
                                        [
                                            "UNSAFE ACT / CONDITION",
                                            selectedCase.unsafe_act_condition,
                                        ],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="
                                    p-4
                                    rounded-[5px]
                                    border
                                    border-[#dce5df]
                                    bg-[#f7faf8]
                                "
                                        >
                                            <span
                                                className="
                                        block
                                        mb-2
                                        text-[#718078]
                                        text-[9px]
                                        font-extrabold
                                        tracking-[0.11em]
                                    "
                                            >
                                                {label}
                                            </span>

                                            <div
                                                className="
                                        text-[#46534b]
                                        text-[13px]
                                        leading-[1.6]
                                    "
                                            >
                                                {value || "—"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Safety intelligence */}

                            <div className="mt-7">

                                <span
                                    className="
                            block
                            mb-3
                            text-[#718078]
                            text-[9px]
                            font-extrabold
                            tracking-[0.13em]
                        "
                                >
                                    SAFETY INTELLIGENCE
                                </span>

                                <div
                                    className="
                            grid
                            grid-cols-1
                            gap-4
                            sm:grid-cols-2
                        "
                                >
                                    <div
                                        className="
                                p-4
                                rounded-[5px]
                                border
                                border-[#dce5df]
                                bg-[#f7faf8]
                            "
                                    >
                                        <span
                                            className="
                                    block
                                    mb-2
                                    text-[#718078]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.11em]
                                "
                                        >
                                            IOGP LIFE-SAVING RULE
                                        </span>

                                        <div
                                            className="
                                    text-[#46534b]
                                    text-[13px]
                                    leading-[1.6]
                                "
                                        >
                                            {selectedCase.iogp_rule || "—"}
                                        </div>
                                    </div>

                                    <div
                                        className="
                                p-4
                                rounded-[5px]
                                border
                                border-[#dce5df]
                                bg-[#f7faf8]
                            "
                                    >
                                        <span
                                            className="
                                    block
                                    mb-2
                                    text-[#718078]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.11em]
                                "
                                        >
                                            SIF POTENTIAL
                                        </span>

                                        <div
                                            className="
                                    text-[#46534b]
                                    text-[13px]
                                    leading-[1.6]
                                "
                                        >
                                            {selectedCase.sif_potential
                                                ? "Yes"
                                                : "No"}
                                        </div>
                                    </div>
                                </div>

                                {selectedCase.lsr_tags?.length > 0 && (
                                    <div
                                        className="
                                mt-4
                                p-4
                                rounded-[5px]
                                border
                                border-[#dce5df]
                                bg-white
                            "
                                    >
                                        <span
                                            className="
                                    block
                                    mb-3
                                    text-[#718078]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.11em]
                                "
                                        >
                                            LSR TAGS
                                        </span>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedCase.lsr_tags.map(
                                                (tag, index) => (
                                                    <span
                                                        key={`${tag}-${index}`}
                                                        className="
                                                px-3
                                                py-1.5
                                                rounded-full
                                                bg-[#edf7f1]
                                                text-[#087542]
                                                text-[11px]
                                                font-bold
                                            "
                                                    >
                                                        {tag}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls and consequences */}

                            <div className="mt-7">

                                <span
                                    className="
                            block
                            mb-3
                            text-[#718078]
                            text-[9px]
                            font-extrabold
                            tracking-[0.13em]
                        "
                                >
                                    CONTROLS & CONSEQUENCES
                                </span>

                                <div className="space-y-4">

                                    {[
                                        [
                                            "BARRIER / CONTROL",
                                            selectedCase.barrier_or_control,
                                        ],
                                        [
                                            "BARRIER FAILURE MODE",
                                            selectedCase.barrier_failure_mode,
                                        ],
                                        [
                                            "BARRIER FUNCTION",
                                            selectedCase.barrier_function,
                                        ],
                                        [
                                            "POTENTIAL CONSEQUENCE",
                                            selectedCase.potential_consequence,
                                        ],
                                        [
                                            "ACTUAL OUTCOME",
                                            selectedCase.actual_outcome,
                                        ],
                                        [
                                            "IMMEDIATE ACTION",
                                            selectedCase.immediate_action,
                                        ],
                                    ].map(([label, value]) => (
                                        <div
                                            key={label}
                                            className="
                                    p-4
                                    rounded-[5px]
                                    border
                                    border-[#dce5df]
                                    bg-white
                                "
                                        >
                                            <span
                                                className="
                                        block
                                        mb-2
                                        text-[#718078]
                                        text-[9px]
                                        font-extrabold
                                        tracking-[0.11em]
                                    "
                                            >
                                                {label}
                                            </span>

                                            <div
                                                className="
                                        text-[#46534b]
                                        text-[13px]
                                        leading-[1.65]
                                    "
                                            >
                                                {value || "—"}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Evidence phrases */}

                            {selectedCase.evidence_phrases?.length > 0 && (
                                <div className="mt-7">

                                    <span
                                        className="
                                block
                                mb-3
                                text-[#718078]
                                text-[9px]
                                font-extrabold
                                tracking-[0.13em]
                            "
                                    >
                                        EVIDENCE PHRASES
                                    </span>

                                    <div
                                        className="
                                p-5
                                rounded-[5px]
                                border
                                border-[#dce5df]
                                bg-[#f7faf8]
                            "
                                    >
                                        <div className="space-y-2">
                                            {selectedCase.evidence_phrases.map(
                                                (phrase, index) => (
                                                    <div
                                                        key={`${phrase}-${index}`}
                                                        className="
                                                flex
                                                gap-3
                                                text-[#46534b]
                                                text-[13px]
                                                leading-[1.6]
                                            "
                                                    >
                                                        <span
                                                            className="
                                                    text-[#087542]
                                                    font-extrabold
                                                "
                                                        >
                                                            •
                                                        </span>

                                                        <span>
                                                            {phrase}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Incident attachments */}

                            {selectedCase.attachments?.length > 0 && (
                                <div className="mt-7">

                                    <span
                                        className="
                                block
                                mb-3
                                text-[#718078]
                                text-[9px]
                                font-extrabold
                                tracking-[0.13em]
                            "
                                    >
                                        INCIDENT EVIDENCE
                                    </span>

                                    <div
                                        className="
                                grid
                                grid-cols-1
                                gap-4
                                sm:grid-cols-2
                            "
                                    >
                                        {selectedCase.attachments.map(
                                            (attachment, index) => {
                                                const isImage =
                                                    attachment.type?.startsWith(
                                                        "image/"
                                                    );

                                                return (
                                                    <div
                                                        key={`${attachment.url}-${index}`}
                                                        className="
                                                overflow-hidden
                                                rounded-[5px]
                                                border
                                                border-[#dce5df]
                                                bg-[#f7faf8]
                                            "
                                                    >
                                                        {isImage ? (
                                                            <a
                                                                href={attachment.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                            >
                                                                <img
                                                                    src={attachment.url}
                                                                    alt={
                                                                        attachment.name ||
                                                                        "Incident evidence"
                                                                    }
                                                                    className="
                                                            w-full
                                                            h-[220px]
                                                            object-cover
                                                            bg-[#edf2ee]
                                                            cursor-pointer
                                                            transition
                                                            hover:opacity-90
                                                        "
                                                                />
                                                            </a>
                                                        ) : (
                                                            <div
                                                                className="
                                                        h-[150px]
                                                        flex
                                                        items-center
                                                        justify-center
                                                        bg-[#edf2ee]
                                                        text-[#718078]
                                                        text-[12px]
                                                        font-semibold
                                                    "
                                                            >
                                                                ATTACHMENT
                                                            </div>
                                                        )}

                                                        <div
                                                            className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                    p-4
                                                "
                                                        >
                                                            <div className="min-w-0">
                                                                <div
                                                                    className="
                                                            truncate
                                                            text-[#17211b]
                                                            text-[12px]
                                                            font-bold
                                                        "
                                                                >
                                                                    {attachment.name ||
                                                                        "Evidence file"}
                                                                </div>

                                                                {attachment.size && (
                                                                    <div
                                                                        className="
                                                                mt-1
                                                                text-[#8a958e]
                                                                text-[10px]
                                                            "
                                                                    >
                                                                        {(
                                                                            attachment.size /
                                                                            1024
                                                                        ).toFixed(1)}{" "}
                                                                        KB
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <a
                                                                href={attachment.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="
                                                        shrink-0
                                                        text-[#087542]
                                                        text-[11px]
                                                        font-extrabold
                                                    "
                                                            >
                                                                Open →
                                                            </a>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Assigned team */}

                            {selectedCase.assigned_team && (
                                <div className="mt-7">

                                    <div
                                        className="
                                p-4
                                rounded-[5px]
                                border
                                border-[#dce5df]
                                bg-[#f7faf8]
                            "
                                    >
                                        <span
                                            className="
                                    block
                                    mb-2
                                    text-[#718078]
                                    text-[9px]
                                    font-extrabold
                                    tracking-[0.11em]
                                "
                                        >
                                            ASSIGNED TEAM
                                        </span>

                                        <div
                                            className="
                                    text-[#17211b]
                                    text-[13px]
                                    font-bold
                                "
                                        >
                                            {selectedCase.assigned_team}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer actions */}

                        <div
                            className="
                    flex
                    flex-col-reverse
                    gap-3
                    px-7
                    py-5
                    border-t
                    border-[#e3e9e5]
                    bg-[#f7faf8]
                    sm:flex-row
                    sm:justify-end
                "
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedCase(null)}
                                className="
                        px-5
                        py-3
                        rounded-[3px]
                        border
                        border-[#d5dfd8]
                        bg-white
                        text-[#59655e]
                        text-[12px]
                        font-bold
                        cursor-pointer
                        transition
                        hover:bg-[#edf2ee]
                    "
                            >
                                Close
                            </button>

                            {selectedCase.case_status === "active" &&
                                !selectedCase.assigned_team && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            navigate(
                                                `/team-proposal/${selectedCase.report_id}`
                                            );
                                        }}
                                        className="
                                px-5
                                py-3
                                rounded-[3px]
                                border-0
                                bg-[#087542]
                                text-white
                                text-[12px]
                                font-extrabold
                                cursor-pointer
                                transition
                                hover:bg-[#075f36]
                                hover:-translate-y-0.5
                            "
                                    >
                                        Submit Team Proposal →
                                    </button>
                                )}
                        </div>
                    </div>
                </div>
            )}
            <Footer />

        </div>
    );
}

export default Dashboard;