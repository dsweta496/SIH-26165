import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubmitSolutionModal
    from "../../components/SubmitSolutionModal";

import Navbar from "../../components/Navbar";
import TeamSidebar from "../../components/TeamSidebar";

import {
    getTeamDashboardStats,
    getTeamCurrentCases,
    getTeamResolvedCases,
    getTeamCaseDetails,
} from "../../api/team.api";


const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const formatSolveTime = (days) => {
    if (days === null || days === undefined) {
        return "—";
    }

    if (days < 1) {
        return `${Math.round(days * 24)} hrs`;
    }

    return `${days.toFixed(1)} days`;
};


const getStatusLabel = (status) => {
    if (!status || status === "solution_needed") {
        return "SOLUTION NEEDED";
    }

    if (status === "pending_review") {
        return "UNDER REVIEW";
    }

    if (status === "changes_requested") {
        return "CHANGES REQUESTED";
    }

    if (status === "approved") {
        return "APPROVED";
    }

    return status
        .replace(/_/g, " ")
        .toUpperCase();
};


const TeamDashboard = () => {
    const navigate = useNavigate();

    const [showSolutionModal, setShowSolutionModal] = useState(false);

    const [team, setTeam] = useState(null);

    const [stats, setStats] = useState({
        currentCases: 0,
        resolvedCases: 0,
        resolvedThisMonth: 0,
        averageSolveTime: null,
    });

    const [currentCases, setCurrentCases] = useState([]);
    const [resolvedCases, setResolvedCases] = useState([]);

    const [selectedCase, setSelectedCase] = useState(null);
    const [caseDetails, setCaseDetails] = useState(null);
    const [caseLoading, setCaseLoading] = useState(false);

    const [activeTab, setActiveTab] = useState("proposal");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    statsResponse,
                    currentResponse,
                    resolvedResponse,
                ] = await Promise.all([
                    getTeamDashboardStats(),
                    getTeamCurrentCases(),
                    getTeamResolvedCases(),
                ]);

                const statsData =
                    statsResponse?.data || {};

                setTeam(
                    statsData.team || null
                );

                setStats({
                    currentCases:
                        statsData.currentCases ?? 0,

                    resolvedCases:
                        statsData.resolvedCases ?? 0,

                    resolvedThisMonth:
                        statsData.resolvedThisMonth ?? 0,

                    averageSolveTime:
                        statsData.averageSolveTime ?? null,
                });

                setCurrentCases(
                    currentResponse?.data || []
                );

                setResolvedCases(
                    resolvedResponse?.data || []
                );

            } catch (err) {
                console.error(
                    "Team dashboard error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load team dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);


    const openCaseDialog = async (reportId) => {
        try {
            setSelectedCase(reportId);
            setActiveTab("proposal");
            setCaseLoading(true);
            setCaseDetails(null);

            const response =
                await getTeamCaseDetails(reportId);

            setCaseDetails(
                response?.data || null
            );

        } catch (err) {
            console.error(
                "Case details error:",
                err
            );
        } finally {
            setCaseLoading(false);
        }
    };


    const closeCaseDialog = () => {
        setSelectedCase(null);
        setCaseDetails(null);
        setActiveTab("proposal");
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7faf8]">
                <Navbar />

                <div className="flex">
                    <TeamSidebar />

                    <main className="flex-1 flex items-center justify-center min-h-[70vh]">
                        <p className="text-[#718078] text-sm">
                            Loading team dashboard...
                        </p>
                    </main>
                </div>
            </div>
        );
    }


    const latestAssigned =
        currentCases.length > 0
            ? currentCases[0]
            : null;

    const latestResolved =
        resolvedCases.length > 0
            ? resolvedCases[0]
            : null;


    return (
        <div className="min-h-screen bg-[#f7faf8]">

            <Navbar />

            <div className="flex">

                <TeamSidebar />

                <main className="flex-1 min-w-0">

                    <div className="max-w-7xl mx-auto px-6 py-10">

                        {/* HEADER */}

                        <section className="mb-10">

                            <p className="text-[#087542] text-[9px] font-extrabold tracking-[0.16em]">
                                TEAM WORKSPACE
                            </p>

                            <h1 className="mt-2 text-[#17211b] text-3xl font-extrabold">
                                Team Dashboard
                            </h1>

                            <p className="mt-2 text-[#718078] text-sm">
                                {team?.team_name
                                    ? `Welcome, ${team.team_name}`
                                    : "Manage your assigned safety cases and solutions."}
                            </p>

                        </section>


                        {error && (
                            <div className="mb-6 p-4 rounded-[6px] border border-red-200 bg-red-50 text-red-700 text-sm">
                                {error}
                            </div>
                        )}


                        {/* STATISTICS */}

                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                            <div className="p-7 rounded-[6px] border border-[#d9e2dc] bg-white shadow-[0_8px_25px_rgba(20,50,35,0.04)]">
                                <span className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                                    CURRENT CASES
                                </span>

                                <strong className="block mt-3 text-[#17211b] text-[38px] leading-none font-extrabold">
                                    {stats.currentCases}
                                </strong>

                                <p className="mt-3 text-[#718078] text-[12px]">
                                    Problems currently assigned
                                </p>
                            </div>


                            <div className="p-7 rounded-[6px] border border-[#d9e2dc] bg-white shadow-[0_8px_25px_rgba(20,50,35,0.04)]">
                                <span className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                                    RESOLVED
                                </span>

                                <strong className="block mt-3 text-[#17211b] text-[38px] leading-none font-extrabold">
                                    {stats.resolvedCases}
                                </strong>

                                <p className="mt-3 text-[#718078] text-[12px]">
                                    Problems successfully resolved
                                </p>
                            </div>


                            <div className="p-7 rounded-[6px] border border-[#d9e2dc] bg-white shadow-[0_8px_25px_rgba(20,50,35,0.04)]">
                                <span className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                                    THIS MONTH
                                </span>

                                <strong className="block mt-3 text-[#17211b] text-[38px] leading-none font-extrabold">
                                    {stats.resolvedThisMonth}
                                </strong>

                                <p className="mt-3 text-[#718078] text-[12px]">
                                    Cases resolved this month
                                </p>
                            </div>


                            <div className="p-7 rounded-[6px] border border-[#d9e2dc] bg-white shadow-[0_8px_25px_rgba(20,50,35,0.04)]">
                                <span className="text-[#718078] text-[9px] font-extrabold tracking-[0.13em]">
                                    AVG. SOLVE TIME
                                </span>

                                <strong className="block mt-3 text-[#17211b] text-[38px] leading-none font-extrabold">
                                    {formatSolveTime(
                                        stats.averageSolveTime
                                    )}
                                </strong>

                                <p className="mt-3 text-[#718078] text-[12px]">
                                    Assignment to resolution
                                </p>
                            </div>

                        </section>


                        {/* LATEST ASSIGNED */}

                        <section className="mb-10">

                            <div className="flex items-end justify-between mb-5">

                                <div>
                                    <p className="text-[#087542] text-[9px] font-extrabold tracking-[0.14em]">
                                        ACTIVE WORK
                                    </p>

                                    <h2 className="mt-1 text-[#17211b] text-xl font-extrabold">
                                        Latest Assigned Case
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/team/cases")
                                    }
                                    className="text-[#087542] text-xs font-bold hover:underline"
                                >
                                    View all →
                                </button>

                            </div>


                            {latestAssigned ? (

                                <button
                                    type="button"
                                    onClick={() =>
                                        openCaseDialog(
                                            latestAssigned.report_id
                                        )
                                    }
                                    className="w-full text-left p-6 bg-white border border-[#d9e2dc] rounded-[6px] shadow-[0_8px_25px_rgba(20,50,35,0.04)] hover:shadow-[0_10px_30px_rgba(20,50,35,0.08)] hover:border-[#b9c9be] transition"
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                        <div>

                                            <div className="flex flex-wrap items-center gap-3">

                                                <span className="text-[#087542] text-xs font-extrabold">
                                                    {latestAssigned.report_id}
                                                </span>

                                                {latestAssigned.sif_level && (
                                                    <span className="px-2 py-1 rounded-full bg-[#fff4df] text-[#9a6700] text-[9px] font-extrabold">
                                                        SIF {latestAssigned.sif_level}
                                                    </span>
                                                )}

                                            </div>

                                            <h3 className="mt-3 text-[#17211b] text-base font-extrabold">
                                                {latestAssigned.hazard ||
                                                    latestAssigned.activity ||
                                                    "Safety Problem"}
                                            </h3>

                                            <p className="mt-2 text-[#718078] text-sm line-clamp-2">
                                                {latestAssigned.report_text ||
                                                    latestAssigned.unsafe_act_condition ||
                                                    "No description available."}
                                            </p>

                                            <p className="mt-4 text-[#8a958e] text-[11px]">
                                                {latestAssigned.site || "Site not specified"}
                                                {" · "}
                                                {latestAssigned.location || "Location not specified"}
                                            </p>

                                        </div>


                                        <div className="shrink-0 lg:text-right">

                                            <span className="inline-block px-3 py-1.5 rounded-full bg-[#fff7e6] text-[#9a6700] text-[9px] font-extrabold">
                                                {getStatusLabel(
                                                    latestAssigned.solution_status
                                                )}
                                            </span>

                                            <p className="mt-3 text-[#087542] text-xs font-bold">
                                                View Case →
                                            </p>

                                        </div>

                                    </div>

                                </button>

                            ) : (

                                <div className="p-10 bg-white border border-[#d9e2dc] rounded-[6px] text-center">
                                    <p className="text-[#718078] text-sm">
                                        No cases are currently assigned to your team.
                                    </p>
                                </div>

                            )}

                        </section>


                        {/* LATEST RESOLVED */}

                        <section>

                            <div className="flex items-end justify-between mb-5">

                                <div>
                                    <p className="text-[#087542] text-[9px] font-extrabold tracking-[0.14em]">
                                        COMPLETED WORK
                                    </p>

                                    <h2 className="mt-1 text-[#17211b] text-xl font-extrabold">
                                        Latest Resolved Case
                                    </h2>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/team/past-cases")
                                    }
                                    className="text-[#087542] text-xs font-bold hover:underline"
                                >
                                    View all →
                                </button>

                            </div>


                            {latestResolved ? (

                                <button
                                    type="button"
                                    onClick={() =>
                                        openCaseDialog(
                                            latestResolved.report_id
                                        )
                                    }
                                    className="w-full text-left p-6 bg-white border border-[#d9e2dc] rounded-[6px] shadow-[0_8px_25px_rgba(20,50,35,0.04)] hover:shadow-[0_10px_30px_rgba(20,50,35,0.08)] hover:border-[#b9c9be] transition"
                                >

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                        <div>

                                            <div className="flex flex-wrap items-center gap-3">

                                                <span className="text-[#087542] text-xs font-extrabold">
                                                    {latestResolved.report_id}
                                                </span>

                                                <span className="px-2 py-1 rounded-full bg-[#eaf4ee] text-[#087542] text-[9px] font-extrabold">
                                                    RESOLVED
                                                </span>

                                            </div>

                                            <h3 className="mt-3 text-[#17211b] text-base font-extrabold">
                                                {latestResolved.hazard ||
                                                    latestResolved.activity ||
                                                    "Resolved Safety Problem"}
                                            </h3>

                                            <p className="mt-2 text-[#718078] text-sm line-clamp-2">
                                                {latestResolved.report_text ||
                                                    latestResolved.unsafe_act_condition ||
                                                    "No description available."}
                                            </p>

                                            <p className="mt-4 text-[#8a958e] text-[11px]">
                                                Resolved{" "}
                                                {formatDate(
                                                    latestResolved.resolved_at
                                                )}
                                            </p>

                                        </div>


                                        <div className="shrink-0 lg:text-right">

                                            <p className="text-[#9aa49e] text-[8px] font-extrabold tracking-[0.1em]">
                                                SOLVE TIME
                                            </p>

                                            <p className="mt-1 text-[#17211b] text-sm font-extrabold">
                                                {formatSolveTime(
                                                    latestResolved.solve_time_days
                                                )}
                                            </p>

                                            <p className="mt-3 text-[#087542] text-xs font-bold">
                                                View Case →
                                            </p>

                                        </div>

                                    </div>

                                </button>

                            ) : (

                                <div className="p-10 bg-white border border-[#d9e2dc] rounded-[6px] text-center">
                                    <p className="text-[#718078] text-sm">
                                        No resolved cases yet.
                                    </p>
                                </div>

                            )}

                        </section>

                    </div>

                </main>

            </div>


            {/* CASE DIALOG */}

            {selectedCase && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
                    onClick={closeCaseDialog}
                >

                    <div
                        className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-white rounded-[8px] shadow-[0_25px_70px_rgba(0,0,0,0.2)]"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* DIALOG HEADER */}

                        <div className="flex items-start justify-between px-7 py-5 border-b border-[#dce4de]">

                            <div>

                                <p className="text-[#087542] text-[9px] font-extrabold tracking-[0.15em]">
                                    TEAM CASE
                                </p>

                                <h2 className="mt-1 text-[#17211b] text-xl font-extrabold">
                                    {selectedCase}
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={closeCaseDialog}
                                className="w-9 h-9 rounded-[4px] bg-[#edf2ee] text-[#66736b] hover:text-[#087542] text-lg"
                            >
                                ×
                            </button>

                        </div>


                        {caseLoading ? (

                            <div className="p-16 text-center">
                                <p className="text-[#718078] text-sm">
                                    Loading case details...
                                </p>
                            </div>

                        ) : caseDetails ? (

                            <div className="max-h-[calc(90vh-85px)] overflow-y-auto">

                                {/* CASE SUMMARY */}

                                <div className="px-7 pt-6">

                                    <h3 className="text-[#17211b] text-lg font-extrabold">
                                        {caseDetails.report?.hazard ||
                                            caseDetails.report?.activity ||
                                            "Safety Problem"}
                                    </h3>

                                    <p className="mt-2 text-[#718078] text-sm">
                                        {caseDetails.report?.report_text ||
                                            "No description available."}
                                    </p>

                                </div>


                                {/* TABS */}

                                <div className="px-7 mt-6 border-b border-[#dce4de]">

                                    <div className="flex gap-7">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("proposal")
                                            }
                                            className={`pb-3 text-xs font-extrabold ${activeTab === "proposal"
                                                ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                                : "text-[#8a958e]"
                                                }`}
                                        >
                                            TEAM PROPOSAL
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("solutions")
                                            }
                                            className={`pb-3 text-xs font-extrabold ${activeTab === "solutions"
                                                ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                                : "text-[#8a958e]"
                                                }`}
                                        >
                                            SOLUTIONS
                                        </button>

                                    </div>

                                </div>


                                <div className="p-7">

                                    {/* PROPOSAL */}

                                    {activeTab === "proposal" && (

                                        <div>

                                            <h3 className="text-[#17211b] text-base font-extrabold">
                                                Accepted Team Proposal
                                            </h3>

                                            {caseDetails.proposal ? (

                                                <div className="mt-4 p-5 bg-[#f7faf8] border border-[#dce4de] rounded-[6px]">

                                                    <p className="text-[#66736b] text-sm whitespace-pre-wrap">
                                                        {caseDetails.proposal.solution_proposal ||
                                                            "No proposal description available."}
                                                    </p>

                                                </div>

                                            ) : (

                                                <p className="mt-4 text-[#718078] text-sm">
                                                    No accepted proposal available.
                                                </p>

                                            )}

                                        </div>

                                    )}


                                    {/* SOLUTIONS */}

                                    {activeTab === "solutions" && (

                                        <div>

                                            <div className="flex items-center justify-between gap-4">

                                                <div>

                                                    <h3 className="text-[#17211b] text-base font-extrabold">
                                                        Solution History
                                                    </h3>

                                                    <p className="mt-1 text-[#718078] text-xs">
                                                        Every submission and review cycle remains available here.
                                                    </p>

                                                </div>


                                                {caseDetails.report?.case_status === "assigned" && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setShowSolutionModal(true)
                                                        }
                                                        className="
                                                           px-4
                                                           py-2.5
                                                   
                                                           rounded-[4px]
                                                   
                                                           bg-[#087542]
                                                           text-white
                                                   
                                                           text-xs
                                                           font-extrabold
                                                           hover:bg-[#075f36]
                                                           transition
                                                       "
                                                    >
                                                        + Submit Solution
                                                    </button>
                                                )}

                                            </div>


                                            <div className="mt-6 space-y-4">

                                                {caseDetails.solutions?.length ? (

                                                    caseDetails.solutions.map(
                                                        (solution) => (

                                                            <div
                                                                key={solution._id}
                                                                className="p-5 border border-[#dce4de] rounded-[6px] bg-white"
                                                            >

                                                                <div className="flex items-center justify-between">

                                                                    <span className="text-[#087542] text-xs font-extrabold">
                                                                        Cycle {solution.review_cycle}
                                                                    </span>

                                                                    <span className="px-2 py-1 rounded-full bg-[#edf2ee] text-[#66736b] text-[9px] font-extrabold">
                                                                        {getStatusLabel(
                                                                            solution.status
                                                                        )}
                                                                    </span>

                                                                </div>


                                                                <p className="mt-4 text-[#53635a] text-sm whitespace-pre-wrap">
                                                                    {solution.solution_text}
                                                                </p>


                                                                {solution.admin_feedback && (

                                                                    <div className="mt-4 p-4 rounded-[4px] bg-[#fff7e6] border border-[#f0dfb8]">

                                                                        <p className="text-[#9a6700] text-[9px] font-extrabold tracking-wide">
                                                                            ADMIN FEEDBACK
                                                                        </p>

                                                                        <p className="mt-2 text-[#72551a] text-xs whitespace-pre-wrap">
                                                                            {solution.admin_feedback}
                                                                        </p>

                                                                    </div>

                                                                )}

                                                            </div>

                                                        )
                                                    )

                                                ) : (

                                                    <div className="p-8 text-center bg-[#f7faf8] rounded-[6px] border border-[#dce4de]">

                                                        <p className="text-[#718078] text-sm">
                                                            No solution has been submitted yet.
                                                        </p>

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    )}

                                </div>

                            </div>

                        ) : (

                            <div className="p-12 text-center">
                                <p className="text-[#718078] text-sm">
                                    Unable to load this case.
                                </p>
                            </div>

                        )}

                    </div>

                </div>

            )}

            {/* SUBMIT MODAL */}
            <SubmitSolutionModal
                open={showSolutionModal}
                onClose={() =>
                    setShowSolutionModal(false)
                }
                proposal={caseDetails?.proposal}
                report={caseDetails?.report}
                team={team}
                onSuccess={() =>
                    openCaseDialog(selectedCase)
                }
            />

        </div>
    );
};


export default TeamDashboard;