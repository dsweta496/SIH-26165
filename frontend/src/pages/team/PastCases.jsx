import React, { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import TeamSidebar from "../../components/TeamSidebar";

import {
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
    if (!status) {
        return "—";
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


const AttachmentDisplay = ({
    attachments,
    title = "ATTACHMENTS",
}) => {

    if (!attachments?.length) {
        return null;
    }


    return (
        <div className="mt-5">

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
                {title}
            </span>


            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                "
            >

                {attachments.map(
                    (attachment, index) => {

                        const isImage =
                            attachment.type?.startsWith(
                                "image/"
                            );


                        return (
                            <div
                                key={
                                    `${attachment.url}-${index}`
                                }
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
                                        href={
                                            attachment.url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                    >

                                        <img
                                            src={
                                                attachment.url
                                            }
                                            alt={
                                                attachment.name ||
                                                "Attachment"
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

                                    <a
                                        href={
                                            attachment.url
                                        }
                                        target="_blank"
                                        rel="noreferrer"
                                        className="
                                            block
                                            h-[150px]
                                            flex
                                            items-center
                                            justify-center
                                            bg-[#edf2ee]
                                            text-[#718078]
                                            text-[12px]
                                            font-semibold
                                            hover:bg-[#e5ece7]
                                            transition
                                        "
                                    >
                                        ATTACHMENT
                                    </a>

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
                                                "Attachment"}
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
                                        href={
                                            attachment.url
                                        }
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
    );
};


const PastCases = () => {

    const [cases, setCases] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    const [selectedCase, setSelectedCase] =
        useState(null);

    const [caseDetails, setCaseDetails] =
        useState(null);

    const [caseLoading, setCaseLoading] =
        useState(false);

    const [activeTab, setActiveTab] =
        useState("proposal");


    const loadCases = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getTeamResolvedCases();

            setCases(
                response?.data || []
            );

        } catch (err) {

            console.error(
                "Past cases error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load past cases."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadCases();

    }, []);


    const openCaseDialog = async (
        reportId
    ) => {

        try {

            setSelectedCase(reportId);

            setActiveTab("proposal");

            setCaseLoading(true);

            setCaseDetails(null);

            const response =
                await getTeamCaseDetails(
                    reportId
                );

            setCaseDetails(
                response?.data || null
            );

        } catch (err) {

            console.error(
                "Past case details error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Failed to load case details."
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


    return (

        <div className="min-h-screen bg-[#f7faf8]">

            <Navbar />


            <div className="flex">

                <TeamSidebar />


                <main className="flex-1 min-w-0">

                    <div className="max-w-7xl mx-auto px-6 py-10">

                        {/* HEADER */}

                        <section className="mb-8">

                            <p className="text-[#087542] text-[9px] font-extrabold tracking-[0.16em]">
                                TEAM HISTORY
                            </p>


                            <h1 className="mt-2 text-[#17211b] text-3xl font-extrabold">
                                Past Cases
                            </h1>


                            <p className="mt-2 text-[#718078] text-sm">
                                Previously resolved safety problems handled by your team.
                            </p>

                        </section>


                        {/* ERROR */}

                        {error && (

                            <div className="mb-6 p-4 rounded-[6px] border border-red-200 bg-red-50 text-red-700 text-sm">

                                {error}

                            </div>

                        )}


                        {/* LOADING */}

                        {loading ? (

                            <div className="p-12 bg-white border border-[#d9e2dc] rounded-[6px] text-center">

                                <p className="text-[#718078] text-sm">
                                    Loading past cases...
                                </p>

                            </div>

                        ) : cases.length === 0 ? (

                            <div className="p-14 bg-white border border-[#d9e2dc] rounded-[6px] text-center">

                                <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-[#eaf4ee] text-[#087542] text-xl">
                                    ◷
                                </div>


                                <h2 className="mt-4 text-[#17211b] text-lg font-extrabold">
                                    No Past Cases
                                </h2>


                                <p className="mt-2 text-[#718078] text-sm">
                                    Your team has not resolved any cases yet.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-4">

                                {cases.map((item) => (

                                    <button
                                        key={
                                            item.report_id
                                        }
                                        type="button"
                                        onClick={() =>
                                            openCaseDialog(
                                                item.report_id
                                            )
                                        }
                                        className="
                                            w-full
                                            text-left
                                            p-6
                                            bg-white
                                            border
                                            border-[#d9e2dc]
                                            rounded-[6px]
                                            shadow-[0_8px_25px_rgba(20,50,35,0.04)]
                                            hover:shadow-[0_10px_30px_rgba(20,50,35,0.08)]
                                            hover:border-[#b9c9be]
                                            transition
                                        "
                                    >

                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                                            {/* CASE INFORMATION */}

                                            <div className="min-w-0">

                                                <div className="flex flex-wrap items-center gap-3">

                                                    <span className="text-[#087542] text-xs font-extrabold">

                                                        {item.report_id}

                                                    </span>


                                                    {item.report_type && (

                                                        <span className="px-2 py-1 rounded-full bg-[#edf2ee] text-[#66736b] text-[9px] font-bold">

                                                            {item.report_type}

                                                        </span>

                                                    )}


                                                    <span className="px-2 py-1 rounded-full bg-[#eaf4ee] text-[#087542] text-[9px] font-extrabold">

                                                        RESOLVED

                                                    </span>

                                                </div>


                                                <h2 className="mt-3 text-[#17211b] text-base font-extrabold">

                                                    {item.hazard ||
                                                        item.activity ||
                                                        "Resolved Safety Problem"}

                                                </h2>


                                                <p className="mt-2 text-[#66736b] text-sm line-clamp-2">

                                                    {item.report_text ||
                                                        item.unsafe_act_condition ||
                                                        "No description available."}

                                                </p>


                                                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#8a958e]">

                                                    <span>

                                                        Site:{" "}

                                                        <strong className="text-[#53635a]">

                                                            {item.site ||
                                                                "Not specified"}

                                                        </strong>

                                                    </span>


                                                    <span>

                                                        Location:{" "}

                                                        <strong className="text-[#53635a]">

                                                            {item.location ||
                                                                "Not specified"}

                                                        </strong>

                                                    </span>


                                                    <span>

                                                        Resolved:{" "}

                                                        <strong className="text-[#53635a]">

                                                            {formatDate(
                                                                item.resolved_at
                                                            )}

                                                        </strong>

                                                    </span>

                                                </div>

                                            </div>


                                            {/* CASE METRICS */}

                                            <div className="shrink-0 lg:text-right">

                                                <div className="grid grid-cols-2 gap-5">

                                                    <div>

                                                        <p className="text-[#9aa49e] text-[8px] font-extrabold tracking-[0.1em]">
                                                            SOLVE TIME
                                                        </p>


                                                        <p className="mt-1 text-[#17211b] text-sm font-extrabold">

                                                            {formatSolveTime(
                                                                item.solve_time_days
                                                            )}

                                                        </p>

                                                    </div>


                                                    <div>

                                                        <p className="text-[#9aa49e] text-[8px] font-extrabold tracking-[0.1em]">
                                                            REVIEWS
                                                        </p>


                                                        <p className="mt-1 text-[#17211b] text-sm font-extrabold">

                                                            {item.review_cycles ??
                                                                "—"}

                                                        </p>

                                                    </div>

                                                </div>


                                                <p className="mt-4 text-[#087542] text-xs font-bold">
                                                    View Case →
                                                </p>

                                            </div>

                                        </div>

                                    </button>

                                ))}

                            </div>

                        )}

                    </div>

                </main>

            </div>


            {/* CASE DIALOG */}

            {selectedCase && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-center
                        justify-center
                        p-4
                        bg-black/40
                    "
                    onClick={closeCaseDialog}
                >

                    <div
                        className="
                            w-full
                            max-w-5xl
                            max-h-[90vh]
                            overflow-hidden
                            bg-white
                            rounded-[8px]
                            shadow-[0_25px_70px_rgba(0,0,0,0.2)]
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* DIALOG HEADER */}

                        <div
                            className="
                                flex
                                items-start
                                justify-between
                                px-7
                                py-5
                                border-b
                                border-[#dce4de]
                            "
                        >

                            <div>

                                <p className="text-[#087542] text-[9px] font-extrabold tracking-[0.15em]">
                                    RESOLVED CASE
                                </p>


                                <h2 className="mt-1 text-[#17211b] text-xl font-extrabold">
                                    {selectedCase}
                                </h2>

                            </div>


                            <button
                                type="button"
                                onClick={closeCaseDialog}
                                className="
                                    w-9
                                    h-9
                                    rounded-[4px]
                                    bg-[#edf2ee]
                                    text-[#66736b]
                                    hover:text-[#087542]
                                    text-lg
                                "
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

                            <div
                                className="
                                    max-h-[calc(90vh-85px)]
                                    overflow-y-auto
                                "
                            >

                                {/* CASE SUMMARY */}

                                <div className="px-7 pt-6">

                                    <div className="flex flex-wrap items-center gap-3">

                                        <h3 className="text-[#17211b] text-lg font-extrabold">

                                            {caseDetails.report?.hazard ||
                                                caseDetails.report?.activity ||
                                                "Resolved Safety Problem"}

                                        </h3>


                                        <span className="px-3 py-1 rounded-full bg-[#eaf4ee] text-[#087542] text-[9px] font-extrabold">

                                            RESOLVED

                                        </span>

                                    </div>


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
                                                setActiveTab(
                                                    "proposal"
                                                )
                                            }
                                            className={`
                                                pb-3
                                                text-xs
                                                font-extrabold
                                                ${
                                                    activeTab === "proposal"
                                                        ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                                        : "text-[#8a958e]"
                                                }
                                            `}
                                        >
                                            TEAM PROPOSAL
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab(
                                                    "solutions"
                                                )
                                            }
                                            className={`
                                                pb-3
                                                text-xs
                                                font-extrabold
                                                ${
                                                    activeTab === "solutions"
                                                        ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                                        : "text-[#8a958e]"
                                                }
                                            `}
                                        >
                                            SOLUTIONS
                                        </button>

                                    </div>

                                </div>


                                <div className="p-7">

                                    {/* TEAM PROPOSAL */}

                                    {activeTab === "proposal" && (

                                        <div>

                                            <h3 className="text-[#17211b] text-base font-extrabold">
                                                Accepted Team Proposal
                                            </h3>


                                            {caseDetails.proposal ? (

                                                <div>

                                                    <div className="mt-4 p-5 bg-[#f7faf8] border border-[#dce4de] rounded-[6px]">

                                                        <p className="text-[#66736b] text-sm whitespace-pre-wrap">

                                                            {caseDetails.proposal.solution_proposal ||
                                                                "No proposal description available."}

                                                        </p>

                                                    </div>


                                                    <AttachmentDisplay
                                                        attachments={
                                                            caseDetails
                                                                .proposal
                                                                ?.attachments
                                                        }
                                                        title="PROPOSAL DOCUMENTS"
                                                    />

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

                                            <div>

                                                <h3 className="text-[#17211b] text-base font-extrabold">
                                                    Solution History
                                                </h3>


                                                <p className="mt-1 text-[#718078] text-xs">
                                                    Every submission and review cycle remains available here.
                                                </p>

                                            </div>


                                            <div className="mt-6 space-y-4">

                                                {caseDetails.solutions?.length ? (

                                                    caseDetails.solutions.map(
                                                        (
                                                            solution
                                                        ) => (

                                                            <div
                                                                key={
                                                                    solution._id ||
                                                                    solution.solution_id
                                                                }
                                                                className="
                                                                    p-5
                                                                    border
                                                                    border-[#dce4de]
                                                                    rounded-[6px]
                                                                    bg-white
                                                                "
                                                            >

                                                                <div className="flex items-center justify-between gap-4">

                                                                    <span className="text-[#087542] text-xs font-extrabold">

                                                                        Cycle{" "}

                                                                        {solution.review_cycle}

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


                                                                <AttachmentDisplay
                                                                    attachments={
                                                                        solution.attachments
                                                                    }
                                                                    title="SOLUTION DOCUMENTS"
                                                                />

                                                            </div>

                                                        )
                                                    )

                                                ) : (

                                                    <div className="p-8 text-center bg-[#f7faf8] rounded-[6px] border border-[#dce4de]">

                                                        <p className="text-[#718078] text-sm">
                                                            No solution history available.
                                                        </p>

                                                    </div>

                                                )}

                                            </div>


                                            {/* RESOLUTION SUMMARY */}

                                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">

                                                <div className="p-4 rounded-[5px] bg-[#f7faf8] border border-[#dce4de]">

                                                    <p className="text-[#718078] text-[8px] font-extrabold tracking-[0.12em]">
                                                        RESOLVED
                                                    </p>


                                                    <p className="mt-2 text-[#17211b] text-sm font-extrabold">

                                                        {formatDate(
                                                            caseDetails.report?.resolved_at
                                                        )}

                                                    </p>

                                                </div>


                                                <div className="p-4 rounded-[5px] bg-[#f7faf8] border border-[#dce4de]">

                                                    <p className="text-[#718078] text-[8px] font-extrabold tracking-[0.12em]">
                                                        SOLVE TIME
                                                    </p>


                                                    <p className="mt-2 text-[#17211b] text-sm font-extrabold">

                                                        {formatSolveTime(
                                                            cases.find(
                                                                (item) =>
                                                                    item.report_id ===
                                                                    selectedCase
                                                            )?.solve_time_days
                                                        )}

                                                    </p>

                                                </div>


                                                <div className="p-4 rounded-[5px] bg-[#eaf4ee] border border-[#cde5d5]">

                                                    <p className="text-[#087542] text-[8px] font-extrabold tracking-[0.12em]">
                                                        FINAL STATUS
                                                    </p>


                                                    <p className="mt-2 text-[#087542] text-sm font-extrabold">
                                                        RESOLVED
                                                    </p>

                                                </div>

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

        </div>

    );

};


export default PastCases;