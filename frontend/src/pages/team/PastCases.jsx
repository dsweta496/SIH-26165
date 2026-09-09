import React, { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import TeamSidebar from "../../components/TeamSidebar";

import {
    getTeamResolvedCases,
    getTeamCaseDetails,
} from "../../api/team.api";

import {
    getSolutionsForProposal,
} from "../../api/solution.api";


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


const isSpecified = (value) => {
    if (value === null || value === undefined) {
        return false;
    }

    if (typeof value === "number") {
        return value !== 0 && !Number.isNaN(value);
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        const normalized = trimmed.toLowerCase();

        if (!trimmed) return false;

        const emptyValues = new Set([
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
            "0",
        ]);

        return !emptyValues.has(normalized);
    }

    if (Array.isArray(value)) {
        return value.some(isSpecified);
    }

    if (typeof value === "object") {
        return Object.values(value).some(isSpecified);
    }

    return true;
};


const formatDetailValue = (value) => {
    if (Array.isArray(value)) {
        return value
            .filter(isSpecified)
            .map(formatDetailValue)
            .join(", ");
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    if (typeof value === "object" && value !== null) {
        return Object.values(value)
            .filter(isSpecified)
            .map(formatDetailValue)
            .join(", ");
    }

    return String(value);
};


const DetailTable = ({ fields }) => {
    const visibleFields = fields.filter(
        ([, value]) => isSpecified(value)
    );

    if (visibleFields.length === 0) {
        return null;
    }

    return (
        <div className="border border-[#dce4de] rounded-[6px] overflow-hidden bg-white">
            {visibleFields.map(([label, value], index) => (
                <div
                    key={`${label}-${index}`}
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-[220px_1fr]
                        border-b
                        border-[#e5ebe7]
                        last:border-b-0
                    "
                >
                    <div
                        className="
                            px-5
                            py-4
                            bg-[#f7faf8]
                            text-[#718078]
                            text-[10px]
                            font-extrabold
                            tracking-[0.09em]
                            uppercase
                        "
                    >
                        {label}
                    </div>

                    <div
                        className="
                            px-5
                            py-4
                            text-[#33423a]
                            text-[13px]
                            leading-[1.6]
                            font-medium
                            whitespace-pre-wrap
                        "
                    >
                        {formatDetailValue(value)}
                    </div>
                </div>
            ))}
        </div>
    );
};


const DetailSection = ({
    title,
    fields,
    children,
    hasContent = false,
}) => {
    const hasVisibleFields = fields
        ? fields.some(([, value]) => isSpecified(value))
        : false;

    if (!hasVisibleFields && !hasContent) {
        return null;
    }

    return (
        <section className="mb-8">
            <div className="mb-3">
                <h3 className="text-sm font-bold tracking-[0.15em] text-[#00844a] uppercase">
                    {title}
                </h3>
            </div>

            {fields && <DetailTable fields={fields} />}

            {children}
        </section>
    );
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
        useState("problem");


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

            setActiveTab("problem");

            setCaseLoading(true);

            setCaseDetails(null);

            const response =
                await getTeamCaseDetails(
                    reportId
                );

            const details = response?.data || null;

            if (!details) {
                setCaseDetails(null);
            } else {
                const proposalId =
                    details.proposal?.proposal_id ||
                    details.proposal_id;

                if (proposalId) {
                    try {
                        const solutionResponse =
                            await getSolutionsForProposal(proposalId);

                        const solutions =
                            solutionResponse?.data || [];

                        setCaseDetails({
                            ...details,
                            solutions,
                        });
                    } catch (solutionError) {
                        console.error(
                            "Failed to load solution history:",
                            solutionError
                        );

                        setCaseDetails({
                            ...details,
                            solutions: details.solutions || [],
                        });
                    }
                } else {
                    setCaseDetails(details);
                }
            }

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

        setActiveTab("problem");

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
                        onClick={(event) => event.stopPropagation()}
                    >
                        {/* HEADER */}

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

                                <h2 className="mt-1 text-[#17211b] text-2xl font-extrabold">
                                    {selectedCase}
                                </h2>

                                {isSpecified(caseDetails?.report?.hazard) && (
                                    <p className="mt-1 text-[#718078] text-sm">
                                        {caseDetails.report.hazard}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={closeCaseDialog}
                                className="
                                    w-10
                                    h-10
                                    shrink-0
                                    rounded-full
                                    border
                                    border-[#dce4de]
                                    bg-white
                                    text-[#66736b]
                                    hover:text-[#087542]
                                    hover:border-[#b9c9be]
                                    text-lg
                                    transition
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
                                    max-h-[calc(90vh-96px)]
                                    overflow-y-auto
                                "
                            >
                                {/* TABS */}

                                <div
                                    className="
                                        px-7
                                        pt-5
                                        border-b
                                        border-[#dce4de]
                                        bg-white
                                        sticky
                                        top-0
                                        z-10
                                    "
                                >
                                    <div className="flex gap-8 overflow-x-auto">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("problem")
                                            }
                                            className={`
                                                shrink-0
                                                pb-3
                                                text-xs
                                                font-extrabold
                                                transition
                                                ${
                                                    activeTab === "problem"
                                                        ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                                        : "text-[#8a958e] hover:text-[#087542]"
                                                }
                                            `}
                                        >
                                            PROBLEM DETAIL
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("proposal")
                                            }
                                            className={`
                                                shrink-0
                                                pb-3
                                                text-xs
                                                font-extrabold
                                                transition
                                                ${
                                                    activeTab === "proposal"
                                                        ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                                        : "text-[#8a958e] hover:text-[#087542]"
                                                }
                                            `}
                                        >
                                            TEAM PROPOSAL
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActiveTab("solutions")
                                            }
                                            className={`
                                                shrink-0
                                                pb-3
                                                text-xs
                                                font-extrabold
                                                transition
                                                ${
                                                    activeTab === "solutions"
                                                        ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                                        : "text-[#8a958e] hover:text-[#087542]"
                                                }
                                            `}
                                        >
                                            SOLUTIONS
                                        </button>
                                    </div>
                                </div>


                                <div className="p-7">

                                    {/* =================================================
                                        TAB 1 — PROBLEM DETAIL
                                    ================================================= */}

                                    {activeTab === "problem" && (
                                        <div>

                                            {/* PROBLEM TITLE */}

                                            <div className="mb-7">
                                                <h3
                                                    className="
                                                        text-[#17211b]
                                                        text-xl
                                                        font-extrabold
                                                    "
                                                >
                                                    {caseDetails.report?.hazard ||
                                                        caseDetails.report?.activity ||
                                                        "Resolved Safety Problem"}
                                                </h3>

                                                {isSpecified(
                                                    caseDetails.report?.report_text
                                                ) && (
                                                    <p
                                                        className="
                                                            mt-2
                                                            text-[#718078]
                                                            text-sm
                                                            leading-[1.7]
                                                        "
                                                    >
                                                        {caseDetails.report.report_text}
                                                    </p>
                                                )}
                                            </div>


                                            {/* INCIDENT INFORMATION */}

                                            <DetailSection
                                                title="INCIDENT INFORMATION"
                                                fields={[
                                                    [
                                                        "Organisation",
                                                        caseDetails.report?.organization,
                                                    ],
                                                    [
                                                        "Sector",
                                                        caseDetails.report?.sector,
                                                    ],
                                                    [
                                                        "Site",
                                                        caseDetails.report?.site,
                                                    ],
                                                    [
                                                        "Incident Serial No.",
                                                        caseDetails.report?.incident_serial_no,
                                                    ],
                                                    [
                                                        "Report Date",
                                                        caseDetails.report?.report_date
                                                            ? new Date(
                                                                caseDetails.report.report_date
                                                            ).toLocaleDateString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                            : null,
                                                    ],
                                                    [
                                                        "Incident Time",
                                                        caseDetails.report?.incident_time,
                                                    ],
                                                    [
                                                        "Incident Classification",
                                                        caseDetails.report?.incident_classification,
                                                    ],
                                                    [
                                                        "Report Stage",
                                                        caseDetails.report?.report_stage,
                                                    ],
                                                    [
                                                        "Incident Category",
                                                        caseDetails.report?.incident_category,
                                                    ],
                                                    [
                                                        "Incident Type",
                                                        caseDetails.report?.incident_type,
                                                    ],
                                                    [
                                                        "Incident Location",
                                                        caseDetails.report?.incident_location,
                                                    ],
                                                ]}
                                            />


                                            {/* ACTIVITY & LOCATION */}

                                            <DetailSection
                                                title="ACTIVITY & LOCATION"
                                                fields={[
                                                    [
                                                        "Activity",
                                                        caseDetails.report?.activity,
                                                    ],
                                                    [
                                                        "Location",
                                                        caseDetails.report?.location,
                                                    ],
                                                    [
                                                        "Equipment",
                                                        caseDetails.report?.equipment,
                                                    ],
                                                    [
                                                        "Language Style",
                                                        caseDetails.report?.language_style,
                                                    ],
                                                ]}
                                            />


                                            {/* INCIDENT DESCRIPTION */}

                                            <DetailSection
                                                title="INCIDENT DESCRIPTION"
                                                hasContent={isSpecified(
                                                    caseDetails.report?.report_text
                                                )}
                                            >
                                                <div
                                                    className="
                                                        p-5
                                                        rounded-[6px]
                                                        border
                                                        border-[#dce4de]
                                                        bg-[#f7faf8]
                                                        text-[#46534b]
                                                        text-[13px]
                                                        leading-[1.8]
                                                        whitespace-pre-wrap
                                                    "
                                                >
                                                    {caseDetails.report.report_text}
                                                </div>
                                            </DetailSection>


                                            {/* SAFETY ANALYSIS */}

                                            <DetailSection
                                                title="SAFETY ANALYSIS"
                                                fields={[
                                                    [
                                                        "Hazard",
                                                        caseDetails.report?.hazard,
                                                    ],
                                                    [
                                                        "Energy Source",
                                                        caseDetails.report?.energy_source,
                                                    ],
                                                    [
                                                        "Exposure",
                                                        caseDetails.report?.exposure,
                                                    ],
                                                    [
                                                        "Unsafe Act / Condition",
                                                        caseDetails.report?.unsafe_act_condition,
                                                    ],
                                                    [
                                                        "Barrier / Control",
                                                        caseDetails.report?.barrier_or_control,
                                                    ],
                                                    [
                                                        "Barrier Failure Mode",
                                                        caseDetails.report?.barrier_failure_mode,
                                                    ],
                                                    [
                                                        "Barrier Function",
                                                        caseDetails.report?.barrier_function,
                                                    ],
                                                    [
                                                        "Potential Consequence",
                                                        caseDetails.report?.potential_consequence,
                                                    ],
                                                    [
                                                        "Actual Outcome",
                                                        caseDetails.report?.actual_outcome,
                                                    ],
                                                ]}
                                            />


                                            {/* FACILITY & IMPACT */}

                                            <DetailSection
                                                title="FACILITY & IMPACT"
                                                fields={[
                                                    [
                                                        "Facility Shutdown",
                                                        caseDetails.report?.facility_shutdown,
                                                    ],
                                                    [
                                                        "Facility Outage",
                                                        caseDetails.report?.facility_outage,
                                                    ],
                                                    [
                                                        "Facility Status",
                                                        caseDetails.report?.facility_status,
                                                    ],
                                                    [
                                                        "Fire Duration (Hours)",
                                                        caseDetails.report?.fire_duration_hours,
                                                    ],
                                                    [
                                                        "Fire Duration (Minutes)",
                                                        caseDetails.report?.fire_duration_minutes,
                                                    ],
                                                    [
                                                        "Direct Loss (₹ Lakhs)",
                                                        caseDetails.report?.direct_loss_in_lakhs,
                                                    ],
                                                    [
                                                        "Indirect Loss",
                                                        caseDetails.report?.indirect_loss,
                                                    ],
                                                ]}
                                            />


                                            {/* PEOPLE IMPACT */}

                                            <DetailSection
                                                title="PEOPLE IMPACT"
                                                fields={[
                                                    [
                                                        "Fatalities — Employees",
                                                        caseDetails.report?.fatalities?.employees,
                                                    ],
                                                    [
                                                        "Fatalities — Contractors",
                                                        caseDetails.report?.fatalities?.contractors,
                                                    ],
                                                    [
                                                        "Fatalities — Others",
                                                        caseDetails.report?.fatalities?.others,
                                                    ],
                                                    [
                                                        "Injuries — Employees",
                                                        caseDetails.report?.injuries?.employees,
                                                    ],
                                                    [
                                                        "Injuries — Contractors",
                                                        caseDetails.report?.injuries?.contractors,
                                                    ],
                                                    [
                                                        "Injuries — Others",
                                                        caseDetails.report?.injuries?.others,
                                                    ],
                                                    [
                                                        "Man Hours Lost — Employees",
                                                        caseDetails.report?.man_hours_lost?.employees,
                                                    ],
                                                    [
                                                        "Man Hours Lost — Contractors",
                                                        caseDetails.report?.man_hours_lost?.contractors,
                                                    ],
                                                    [
                                                        "Man Hours Lost — Others",
                                                        caseDetails.report?.man_hours_lost?.others,
                                                    ],
                                                ]}
                                            />


                                            {/* FOLLOW-UP & INVESTIGATION */}

                                            <DetailSection
                                                title="FOLLOW-UP & INVESTIGATION"
                                                fields={[
                                                    [
                                                        "Post-Incident Measures",
                                                        caseDetails.report?.post_incident_measures,
                                                    ],
                                                    [
                                                        "Similar Incident Occurred",
                                                        caseDetails.report?.similar_incident_occurred,
                                                    ],
                                                    [
                                                        "Similar Incident Description",
                                                        caseDetails.report?.similar_incident_description,
                                                    ],
                                                    [
                                                        "Internal Investigation Completed",
                                                        caseDetails.report?.internal_investigation_completed,
                                                    ],
                                                    [
                                                        "Investigation Completion Date",
                                                        caseDetails.report?.internal_investigation_completion_date
                                                            ? new Date(
                                                                caseDetails.report.internal_investigation_completion_date
                                                            ).toLocaleDateString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                            : null,
                                                    ],
                                                    [
                                                        "Investigation Report Submitted to OISD",
                                                        caseDetails.report?.internal_investigation_report_submitted_to_oisd,
                                                    ],
                                                    [
                                                        "Expected OISD Submission Date",
                                                        caseDetails.report?.expected_oisd_submission_date
                                                            ? new Date(
                                                                caseDetails.report.expected_oisd_submission_date
                                                            ).toLocaleDateString("en-IN", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                            : null,
                                                    ],
                                                ]}
                                            />


                                            {/* ORIGINAL EVIDENCE */}

                                            {caseDetails.report?.attachments?.length > 0 && (
                                                <DetailSection
                                                    title="ORIGINAL EVIDENCE"
                                                    hasContent={true}
                                                >
                                                    <AttachmentDisplay
                                                        attachments={
                                                            caseDetails.report.attachments
                                                        }
                                                        title="PROBLEM REPORT DOCUMENTS"
                                                    />
                                                </DetailSection>
                                            )}


                                            {/* RESOLUTION SUMMARY */}

                                            <DetailSection
                                                title="RESOLUTION SUMMARY"
                                                fields={[
                                                    [
                                                        "Resolved Date",
                                                        caseDetails.report?.resolved_at
                                                            ? formatDate(
                                                                caseDetails.report.resolved_at
                                                            )
                                                            : null,
                                                    ],
                                                    [
                                                        "Solve Time",
                                                        cases.find(
                                                            (item) =>
                                                                item.report_id ===
                                                                selectedCase
                                                        )?.solve_time_days !==
                                                            undefined &&
                                                        cases.find(
                                                            (item) =>
                                                                item.report_id ===
                                                                selectedCase
                                                        )?.solve_time_days !==
                                                            null
                                                            ? formatSolveTime(
                                                                cases.find(
                                                                    (item) =>
                                                                        item.report_id ===
                                                                        selectedCase
                                                                )?.solve_time_days
                                                            )
                                                            : null,
                                                    ],
                                                    [
                                                        "Final Status",
                                                        "RESOLVED",
                                                    ],
                                                ]}
                                            />

                                        </div>
                                    )}


                                    {/* =================================================
                                        TAB 2 — TEAM PROPOSAL
                                    ================================================= */}

                                    {activeTab === "proposal" && (
                                        <div>

                                            <h3
                                                className="
                                                    text-[#17211b]
                                                    text-base
                                                    font-extrabold
                                                "
                                            >
                                                Accepted Team Proposal
                                            </h3>

                                            {caseDetails.proposal ? (
                                                <div className="mt-4">

                                                    {isSpecified(
                                                        caseDetails.proposal.solution_proposal
                                                    ) && (
                                                        <div
                                                            className="
                                                                p-5
                                                                bg-[#f7faf8]
                                                                border
                                                                border-[#dce4de]
                                                                rounded-[6px]
                                                            "
                                                        >
                                                            <p
                                                                className="
                                                                    text-[#66736b]
                                                                    text-sm
                                                                    leading-[1.7]
                                                                    whitespace-pre-wrap
                                                                "
                                                            >
                                                                {
                                                                    caseDetails
                                                                        .proposal
                                                                        .solution_proposal
                                                                }
                                                            </p>
                                                        </div>
                                                    )}

                                                    <AttachmentDisplay
                                                        attachments={
                                                            caseDetails.proposal?.attachments
                                                        }
                                                        title="PROPOSAL DOCUMENTS"
                                                    />

                                                    {!isSpecified(
                                                        caseDetails.proposal.solution_proposal
                                                    ) &&
                                                        !caseDetails.proposal?.attachments
                                                            ?.length && (
                                                            <p className="mt-4 text-[#718078] text-sm">
                                                                No proposal details available.
                                                            </p>
                                                        )}

                                                </div>
                                            ) : (
                                                <p className="mt-4 text-[#718078] text-sm">
                                                    No accepted proposal available.
                                                </p>
                                            )}

                                        </div>
                                    )}


                                    {/* =================================================
                                        TAB 3 — SOLUTIONS
                                    ================================================= */}

                                    {activeTab === "solutions" && (
                                        <div>

                                            <div>
                                                <h3
                                                    className="
                                                        text-[#17211b]
                                                        text-base
                                                        font-extrabold
                                                    "
                                                >
                                                    Solution History
                                                </h3>

                                                <p
                                                    className="
                                                        mt-1
                                                        text-[#718078]
                                                        text-xs
                                                    "
                                                >
                                                    Every submission and review cycle remains available here.
                                                </p>
                                            </div>


                                            <div className="mt-6 space-y-4">

                                                {caseDetails.solutions?.length ? (
                                                    caseDetails.solutions.map(
                                                        (solution) => (
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

                                                                    <span
                                                                        className="
                                                                            text-[#087542]
                                                                            text-xs
                                                                            font-extrabold
                                                                        "
                                                                    >
                                                                        Cycle{" "}
                                                                        {solution.review_cycle}
                                                                    </span>

                                                                    {isSpecified(
                                                                        solution.status
                                                                    ) && (
                                                                        <span
                                                                            className="
                                                                                px-2
                                                                                py-1
                                                                                rounded-full
                                                                                bg-[#edf2ee]
                                                                                text-[#66736b]
                                                                                text-[9px]
                                                                                font-extrabold
                                                                            "
                                                                        >
                                                                            {getStatusLabel(
                                                                                solution.status
                                                                            )}
                                                                        </span>
                                                                    )}

                                                                </div>


                                                                {isSpecified(
                                                                    solution.solution_text
                                                                ) && (
                                                                    <p
                                                                        className="
                                                                            mt-4
                                                                            text-[#53635a]
                                                                            text-sm
                                                                            whitespace-pre-wrap
                                                                        "
                                                                    >
                                                                        {
                                                                            solution.solution_text
                                                                        }
                                                                    </p>
                                                                )}


                                                                <AttachmentDisplay
                                                                    attachments={
                                                                        solution.attachments
                                                                    }
                                                                    title={`CYCLE ${solution.review_cycle} DOCUMENTS`}
                                                                />


                                                                {isSpecified(
                                                                    solution.admin_feedback
                                                                ) && (
                                                                    <div
                                                                        className="
                                                                            mt-4
                                                                            p-4
                                                                            rounded-[4px]
                                                                            bg-[#fff7e6]
                                                                            border
                                                                            border-[#f0dfb8]
                                                                        "
                                                                    >
                                                                        <p
                                                                            className="
                                                                                text-[#9a6700]
                                                                                text-[9px]
                                                                                font-extrabold
                                                                                tracking-wide
                                                                            "
                                                                        >
                                                                            ADMIN FEEDBACK
                                                                        </p>

                                                                        <p
                                                                            className="
                                                                                mt-2
                                                                                text-[#72551a]
                                                                                text-xs
                                                                                whitespace-pre-wrap
                                                                            "
                                                                        >
                                                                            {
                                                                                solution.admin_feedback
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                )}

                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <div
                                                        className="
                                                            p-8
                                                            text-center
                                                            bg-[#f7faf8]
                                                            rounded-[6px]
                                                            border
                                                            border-[#dce4de]
                                                        "
                                                    >
                                                        <p className="text-[#718078] text-sm">
                                                            No solution history available.
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

        </div>

    );

};


export default PastCases;