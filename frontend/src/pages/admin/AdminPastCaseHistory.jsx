import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

import api from "../../api/axios";

import {
    getSolutionsForProposal,
} from "../../api/solution.api";

import {
    getProposalsForReport,
} from "../../api/teamProposal.api";

import {
    getProblemReportById,
} from "../../api/problemReport.api";


function AdminPastCaseHistory() {

    const [cases, setCases] = useState([]);

    const [selectedCase, setSelectedCase] =
        useState(null);

    const [activeTab, setActiveTab] =
        useState("solutions");

    const [assignedProposal, setAssignedProposal] =
        useState(null);

    const [detailLoading, setDetailLoading] =
        useState(false);

    const [proposalLoading, setProposalLoading] =
        useState(false);

    const [solutions, setSolutions] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [solutionsLoading, setSolutionsLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [solutionsError, setSolutionsError] =
        useState("");

    const [csvLoading, setCsvLoading] =
        useState(false);


    /* =========================================================
       LOAD RESOLVED CASES
    ========================================================= */

    const loadResolvedCases = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/resolved-cases"
            );

            setCases(
                response?.data?.data || []
            );

        } catch (err) {

            console.error(
                "Load resolved cases error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load resolved cases."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadResolvedCases();
    }, []);


    /* =========================================================
       OPEN CASE
    ========================================================= */

    const handleOpenCase = async (caseItem) => {
        try {
            setSelectedCase(caseItem);

            // IMPORTANT:
            // Popup always opens on Solutions.
            setActiveTab("solutions");

            setSolutions(
                caseItem.solutions || []
            );

            setAssignedProposal(null);

            setSolutionsError("");

            setDetailLoading(true);
            setProposalLoading(true);

            /*
             * Load the complete problem report.
             * The resolved-cases endpoint may contain only
             * the summary fields needed by the table.
             */
            const reportPromise =
                getProblemReportById(
                    caseItem.report_id
                );

            /*
             * Load all proposals for this report so we
             * can identify the proposal belonging to the
             * team that was actually assigned.
             */
            const proposalPromise =
                getProposalsForReport(
                    caseItem.report_id
                );

            const [
                reportResponse,
                proposalResponse,
            ] = await Promise.allSettled([
                reportPromise,
                proposalPromise,
            ]);

            /*
             * Merge the full report into the existing
             * resolved-case object.
             */
            if (
                reportResponse.status ===
                "fulfilled" &&
                reportResponse.value?.data
            ) {
                setSelectedCase({
                    ...caseItem,
                    ...reportResponse.value.data,
                });
            }

            /*
             * Find the proposal belonging to the
             * assigned team.
             */
            if (
                proposalResponse.status ===
                "fulfilled"
            ) {
                const proposalList =
                    proposalResponse.value?.data || [];

                const assignedTeam =
                    caseItem.assigned_team;

                const matchedProposal =
                    proposalList.find(
                        (proposal) =>
                            proposal.team_name ===
                            assignedTeam ||
                            proposal.team_id ===
                            assignedTeam
                    ) ||
                    proposalList.find((proposal) =>
                        [
                            "accepted",
                            "approved",
                            "assigned",
                        ].includes(
                            String(
                                proposal.status || ""
                            ).toLowerCase()
                        )
                    );

                setAssignedProposal(
                    matchedProposal || null
                );
            }
        } catch (err) {
            console.error(
                "Load past case details error:",
                err
            );

            setSolutionsError(
                "Unable to load complete case details."
            );
        } finally {
            setDetailLoading(false);
            setProposalLoading(false);
        }
    };

    /* =========================================================
       CLOSE DIALOG
    ========================================================= */

    const handleClose = () => {
        setSelectedCase(null);
        setSolutions([]);
        setAssignedProposal(null);

        setActiveTab("solutions");

        setSolutionsError("");

        setDetailLoading(false);
        setProposalLoading(false);
    };


    /* =========================================================
       DOWNLOAD CSV
    ========================================================= */

    const handleDownloadCSV = async () => {

        try {

            setCsvLoading(true);

            const response = await api.get(
                "/export/resolved-cases/csv",
                {
                    responseType: "blob",
                }
            );

            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "text/csv;charset=utf-8;",
                    }
                );

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `sih26165-resolved-case-history-${Date.now()}.csv`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );

        } catch (err) {

            console.error(
                "CSV download error:",
                err
            );

            alert(
                err?.response?.data?.message ||
                "Unable to download CSV."
            );

        } finally {

            setCsvLoading(false);

        }
    };


    /* =========================================================
       DATE FORMAT
    ========================================================= */

    const formatDate = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };


    const formatDateTime = (date) => {

        if (!date) {
            return "—";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "—";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const hasEnteredValue = (value) => {
        if (
            value === null ||
            value === undefined
        ) {
            return false;
        }

        if (Array.isArray(value)) {
            return (
                value.length > 0 &&
                value.some(
                    (item) =>
                        item !== null &&
                        item !== undefined &&
                        String(item).trim() !== "" &&
                        String(item)
                            .trim()
                            .toUpperCase() !==
                        "NOT_STATED" &&
                        String(item)
                            .trim()
                            .toUpperCase() !==
                        "NOT STATED"
                )
            );
        }

        if (typeof value === "boolean") {
            return true;
        }

        const normalizedValue =
            String(value).trim();

        return (
            normalizedValue !== "" &&
            normalizedValue.toUpperCase() !==
            "NOT_STATED" &&
            normalizedValue.toUpperCase() !==
            "NOT STATED"
        );
    };


    const formatDisplayValue = (value) => {
        if (Array.isArray(value)) {
            return value
                .filter(
                    (item) =>
                        item !== null &&
                        item !== undefined &&
                        String(item).trim() !== "" &&
                        String(item)
                            .trim()
                            .toUpperCase() !==
                        "NOT_STATED"
                )
                .map((item) =>
                    String(item)
                        .replace(/_/g, " ")
                        .replace(
                            /\b\w/g,
                            (char) =>
                                char.toUpperCase()
                        )
                )
                .join(", ");
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        if (typeof value === "string") {
            return value
                .replace(/_/g, " ")
                .replace(
                    /\b\w/g,
                    (char) =>
                        char.toUpperCase()
                );
        }

        return value;
    };


    const problemDetailFields = selectedCase
        ? [
            [
                "Organisation",
                selectedCase.organization,
            ],
            [
                "Sector",
                selectedCase.sector,
            ],
            [
                "Site",
                selectedCase.site,
            ],
            [
                "Incident Serial No.",
                selectedCase.incident_serial_no,
            ],
            [
                "Report Date",
                formatDate(
                    selectedCase.report_date
                ),
            ],
            [
                "Incident Time",
                selectedCase.incident_time,
            ],
            [
                "Incident Classification",
                selectedCase.incident_classification,
            ],
            [
                "Report Stage",
                selectedCase.report_stage,
            ],
            [
                "Incident Category",
                selectedCase.incident_category,
            ],
            [
                "Incident Type",
                selectedCase.incident_type,
            ],
            [
                "Incident Location",
                selectedCase.incident_location,
            ],
            [
                "Activity",
                selectedCase.activity,
            ],
            [
                "Location",
                selectedCase.location,
            ],
            [
                "Equipment",
                selectedCase.equipment,
            ],
            [
                "Hazard",
                selectedCase.hazard,
            ],
            [
                "Energy Source",
                selectedCase.energy_source,
            ],
            [
                "Actual Outcome",
                selectedCase.actual_outcome,
            ],
            [
                "Facility Shutdown",
                selectedCase.facility_shutdown,
            ],
            [
                "Facility Outage",
                selectedCase.facility_outage,
            ],
            [
                "Facility Status",
                selectedCase.facility_status,
            ],
            [
                "Fire Duration (Hours)",
                selectedCase.fire_duration_hours,
            ],
            [
                "Fire Duration (Minutes)",
                selectedCase.fire_duration_minutes,
            ],
            [
                "Fatalities — Employees",
                selectedCase.fatalities?.employees,
            ],
            [
                "Fatalities — Contractors",
                selectedCase.fatalities?.contractors,
            ],
            [
                "Fatalities — Others",
                selectedCase.fatalities?.others,
            ],
            [
                "Injuries — Employees",
                selectedCase.injuries?.employees,
            ],
            [
                "Injuries — Contractors",
                selectedCase.injuries?.contractors,
            ],
            [
                "Injuries — Others",
                selectedCase.injuries?.others,
            ],
            [
                "Man Hours Lost — Employees",
                selectedCase.man_hours_lost?.employees,
            ],
            [
                "Man Hours Lost — Contractors",
                selectedCase.man_hours_lost?.contractors,
            ],
            [
                "Man Hours Lost — Others",
                selectedCase.man_hours_lost?.others,
            ],
            [
                "Direct Loss (₹ Lakhs)",
                selectedCase.direct_loss_in_lakhs,
            ],
            [
                "Indirect Loss",
                selectedCase.indirect_loss,
            ],
            [
                "Similar Incident Occurred",
                selectedCase.similar_incident_occurred,
            ],
            [
                "Similar Incident Description",
                selectedCase.similar_incident_description,
            ],
            [
                "Internal Investigation Completed",
                selectedCase.internal_investigation_completed,
            ],
            [
                "Internal Investigation Completion Date",
                formatDate(
                    selectedCase.internal_investigation_completion_date
                ),
            ],
            [
                "Investigation Report Submitted to OISD",
                selectedCase.internal_investigation_report_submitted_to_oisd,
            ],
            [
                "Expected OISD Submission Date",
                formatDate(
                    selectedCase.expected_oisd_submission_date
                ),
            ],
            [
                "Cause of Incident",
                selectedCase.cause_of_incident,
            ],
            [
                "Leakage Cause",
                selectedCase.leakage_cause,
            ],
            [
                "Leakage Cause Details",
                selectedCase.leakage_cause_details,
            ],
            [
                "Ignition Cause",
                selectedCase.ignition_cause,
            ],
            [
                "Ignition Cause Details",
                selectedCase.ignition_cause_details,
            ],
            [
                "Avoidable",
                selectedCase.avoidable,
            ],
            [
                "Avoidance Factors",
                selectedCase.avoidance_factors,
            ],
            [
                "Barrier / Control",
                selectedCase.barrier_or_control,
            ],
            [
                "Barrier Failure Mode",
                selectedCase.barrier_failure_mode,
            ],
            [
                "Barrier Function",
                selectedCase.barrier_function,
            ],
            [
                "Potential Consequence",
                selectedCase.potential_consequence,
            ],
            [
                "Language Style",
                selectedCase.language_style,
            ],
        ].filter(([, value]) =>
            hasEnteredValue(value)
        )
        : [];




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
                "
            >

                <div
                    className="
                        w-10
                        h-10

                        rounded-full

                        border-4
                        border-[#dce8e0]
                        border-t-[#087542]

                        animate-spin
                    "
                />

                <p
                    className="
                        mt-5

                        text-[#718078]

                        text-[14px]
                    "
                >
                    Loading case history...
                </p>

            </div>
        );
    };




    /* =========================================================
       MAIN
    ========================================================= */

    return (
        <div
            className="
                min-h-screen

                flex
                flex-col

                bg-[#f5f8f6]

                text-[#17211b]
            "
        >

            <Navbar />


            <div
                className="
                    flex
                    items-start

                    flex-1
                "
            >

                <AdminSidebar />


                <main
                    className="
                        min-w-0
                        flex-1

                        px-[5%]
                        py-10

                        lg:px-[4%]
                        lg:py-[55px]
                    "
                >

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <section
                        className="
                            mb-10
                        "
                    >

                        <p
                            className="
                                mb-3

                                text-[#087542]

                                text-[10px]
                                font-extrabold

                                tracking-[0.2em]
                            "
                        >
                            CASE ARCHIVE
                        </p>


                        <div
                            className="
                                flex
                                flex-col

                                gap-6

                                md:flex-row
                                md:items-end
                                md:justify-between
                            "
                        >

                            <div>

                                <h1
                                    className="
                                        text-[#17211b]

                                        text-[clamp(40px,4vw,58px)]
                                        leading-[0.95]

                                        font-extrabold

                                        tracking-[-0.06em]
                                    "
                                >
                                    Past Case History
                                </h1>

                                <p
                                    className="
                                        max-w-[650px]

                                        mt-4

                                        text-[#718078]

                                        text-[15px]
                                        leading-[1.7]
                                    "
                                >
                                    Browse resolved cases and review
                                    the solutions submitted during
                                    their resolution.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleDownloadCSV
                                }
                                disabled={
                                    csvLoading
                                }
                                className="
                                    shrink-0

                                    px-6
                                    py-3.5

                                    rounded-[3px]

                                    border
                                    border-[#087542]

                                    bg-[#087542]

                                    text-white

                                    text-[11px]
                                    font-extrabold

                                    cursor-pointer

                                    hover:bg-[#065c38]

                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {csvLoading
                                    ? "Preparing CSV..."
                                    : "Download CSV ↓"}
                            </button>

                        </div>

                    </section>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (

                        <div
                            className="
                                mb-6

                                p-5

                                rounded-[5px]

                                border
                                border-[#f0cccc]

                                bg-[#fff6f6]

                                text-[#c62828]

                                text-[13px]
                                font-bold
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        EMPTY
                    ================================================= */}

                    {!error &&
                        cases.length === 0 && (

                            <div
                                className="
                                    rounded-[5px]

                                    border
                                    border-[#dce4de]

                                    bg-white

                                    px-8
                                    py-20

                                    text-center
                                "
                            >

                                <div
                                    className="
                                        mx-auto

                                        w-16
                                        h-16

                                        flex
                                        items-center
                                        justify-center

                                        rounded-full

                                        bg-[#eaf4ee]

                                        text-[#087542]

                                        text-[24px]
                                    "
                                >
                                    ✓
                                </div>

                                <h2
                                    className="
                                        mt-6

                                        text-[#17211b]

                                        text-[24px]
                                        font-extrabold
                                    "
                                >
                                    No resolved cases yet
                                </h2>

                                <p
                                    className="
                                        max-w-[470px]

                                        mx-auto
                                        mt-3

                                        text-[#718078]

                                        text-[14px]
                                        leading-[1.7]
                                    "
                                >
                                    Resolved cases will appear here
                                    after an approved solution closes
                                    a case.
                                </p>

                            </div>

                        )}


                    {/* =================================================
                        CASE LIST
                    ================================================= */}

                    {cases.length > 0 && (

                        <div
                            className="
                                overflow-hidden

                                rounded-[5px]

                                border
                                border-[#dce4de]

                                bg-white
                            "
                        >

                            {/* TABLE HEADER */}

                            <div
                                className="
                                    hidden

                                    px-6
                                    py-4

                                    border-b
                                    border-[#e4eae5]

                                    bg-[#f9fbfa]

                                    md:grid
                                    md:grid-cols-[1.2fr_1.2fr_1.3fr_1fr_auto]

                                    md:items-center
                                    md:gap-5
                                "
                            >

                                <TableHeader>
                                    CASE
                                </TableHeader>

                                <TableHeader>
                                    SITE
                                </TableHeader>

                                <TableHeader>
                                    ASSIGNED TEAM
                                </TableHeader>

                                <TableHeader>
                                    RESOLVED
                                </TableHeader>

                                <TableHeader>
                                    VIEW
                                </TableHeader>

                            </div>


                            {cases.map(
                                (caseItem) => (

                                    <button
                                        key={
                                            caseItem.report_id
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleOpenCase(
                                                caseItem
                                            )
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
                                            border-[#e4eae5]

                                            bg-white

                                            text-left

                                            cursor-pointer

                                            transition

                                            hover:bg-[#f9fbfa]

                                            md:grid-cols-[1.2fr_1.2fr_1.3fr_1fr_auto]

                                            md:items-center
                                            md:gap-5

                                            last:border-b-0
                                        "
                                    >

                                        <div>

                                            <span
                                                className="
                                                    block
                                                    md:hidden

                                                    text-[#718078]

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.12em]
                                                "
                                            >
                                                CASE
                                            </span>

                                            <strong
                                                className="
                                                    block

                                                    mt-1
                                                    md:mt-0

                                                    text-[#17211b]

                                                    text-[14px]
                                                    font-extrabold
                                                "
                                            >
                                                {
                                                    caseItem.report_id
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span
                                                className="
                                                    block
                                                    md:hidden

                                                    text-[#718078]

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.12em]
                                                "
                                            >
                                                SITE
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-1
                                                    md:mt-0

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                "
                                            >
                                                {
                                                    caseItem.site ||
                                                    "—"
                                                }
                                            </span>

                                        </div>


                                        <div>

                                            <span
                                                className="
                                                    block
                                                    md:hidden

                                                    text-[#718078]

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.12em]
                                                "
                                            >
                                                ASSIGNED TEAM
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-1
                                                    md:mt-0

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                    font-semibold
                                                "
                                            >
                                                {
                                                    caseItem.assigned_team ||
                                                    "—"
                                                }
                                            </span>

                                        </div>


                                        <div>

                                            <span
                                                className="
                                                    block
                                                    md:hidden

                                                    text-[#718078]

                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.12em]
                                                "
                                            >
                                                RESOLVED
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-1
                                                    md:mt-0

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                "
                                            >
                                                {
                                                    formatDate(
                                                        caseItem.resolved_at
                                                    )
                                                }
                                            </span>

                                        </div>


                                        <div
                                            className="
                                                flex
                                                items-center

                                                md:justify-end
                                            "
                                        >

                                            <span
                                                className="
                                                    text-[#087542]

                                                    text-[12px]
                                                    font-extrabold
                                                "
                                            >
                                                View History →
                                            </span>

                                        </div>

                                    </button>

                                )
                            )}

                        </div>

                    )}

                </main>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div
                className="
                    lg:ml-[265px]
                "
            >
                <Footer />
            </div>


            {/* =================================================
                CASE HISTORY DIALOG
            ================================================= */}

            {/* =================================================
    CASE HISTORY DIALOG
================================================= */}

            {selectedCase && (
                <div
                    className="
            fixed
            inset-0
            z-[100]

            flex
            items-center
            justify-center

            bg-[#0b2117]/60

            p-4
            sm:p-6
        "
                >
                    <div
                        className="
                relative

                w-full
                max-w-[1100px]

                max-h-[92vh]

                flex
                flex-col

                overflow-hidden

                rounded-[6px]

                bg-white

                shadow-[0_25px_80px_rgba(0,0,0,0.25)]
            "
                    >

                        {/* =================================================
                HEADER
            ================================================= */}

                        <div
                            className="
                    shrink-0

                    flex
                    items-start
                    justify-between

                    gap-5

                    px-8
                    py-6

                    border-b
                    border-[#dce4de]

                    bg-white
                "
                        >
                            <div>
                                <p
                                    className="
                            mb-2

                            text-[#087542]
                            text-[10px]
                            font-extrabold
                            tracking-[0.18em]
                        "
                                >
                                    RESOLVED CASE
                                </p>

                                <h2
                                    className="
                            text-[#17211b]
                            text-[30px]
                            leading-none
                            font-extrabold
                            tracking-[-0.04em]
                        "
                                >
                                    {selectedCase.report_id}
                                </h2>

                                <p
                                    className="
                            mt-3

                            text-[#718078]
                            text-[13px]
                        "
                                >
                                    {selectedCase.site ||
                                        "Resolved safety case"}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleClose}
                                className="
                        w-10
                        h-10

                        flex
                        items-center
                        justify-center

                        shrink-0

                        rounded-full
                        border
                        border-[#dce4de]

                        bg-white

                        text-[#66736b]
                        text-[20px]

                        cursor-pointer

                        hover:bg-[#f5f8f6]
                    "
                            >
                                ×
                            </button>
                        </div>


                        {/* =================================================
                TABS
            ================================================= */}

                        <div
                            className="
                    shrink-0

                    flex

                    overflow-x-auto

                    border-b
                    border-[#dce4de]

                    bg-[#f9fbfa]
                "
                        >
                            {[
                                {
                                    id: "problem",
                                    label: "Problem Detail",
                                },
                                {
                                    id: "proposal",
                                    label: "Team Proposal",
                                },
                                {
                                    id: "solutions",
                                    label: "Solutions",
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() =>
                                        setActiveTab(tab.id)
                                    }
                                    className={`
                            relative

                            shrink-0

                            px-7
                            py-4

                            border-0

                            bg-transparent

                            text-[11px]
                            font-extrabold

                            tracking-[0.04em]

                            cursor-pointer

                            transition

                            ${activeTab === tab.id
                                            ? "text-[#087542]"
                                            : "text-[#718078] hover:text-[#33423a]"
                                        }
                        `}
                                >
                                    {tab.label}

                                    {tab.id === "solutions" &&
                                        solutions.length > 0 && (
                                            <span
                                                className="
                                        ml-2
                                        px-2
                                        py-0.5

                                        rounded-full

                                        bg-[#eaf4ee]

                                        text-[#087542]
                                        text-[9px]
                                    "
                                            >
                                                {solutions.length}
                                            </span>
                                        )}

                                    {activeTab === tab.id && (
                                        <span
                                            className="
                                    absolute
                                    left-5
                                    right-5
                                    bottom-0

                                    h-[3px]

                                    rounded-t

                                    bg-[#087542]
                                "
                                        />
                                    )}
                                </button>
                            ))}
                        </div>


                        {/* =================================================
                CONTENT
            ================================================= */}

                        <div
                            className="
                    min-h-0
                    flex-1

                    overflow-y-auto
                "
                        >

                            {/* =================================================
                    TAB 1 — PROBLEM DETAIL
                ================================================= */}

                            {activeTab === "problem" && (
                                <div
                                    className="
                            px-8
                            py-8

                            space-y-9
                        "
                                >

                                    {detailLoading ? (
                                        <LoadingBlock
                                            text="Loading problem details..."
                                        />
                                    ) : (
                                        <>
                                            {/* CASE SUMMARY */}

                                            <section>
                                                <SectionTitle>
                                                    Case Information
                                                </SectionTitle>

                                                <div
                                                    className="
                                            grid
                                            grid-cols-1
                                            gap-4

                                            sm:grid-cols-2
                                            lg:grid-cols-4
                                        "
                                                >
                                                    <InfoField
                                                        label="Case"
                                                        value={
                                                            selectedCase.report_id
                                                        }
                                                    />

                                                    <InfoField
                                                        label="Site"
                                                        value={
                                                            selectedCase.site
                                                        }
                                                    />

                                                    <InfoField
                                                        label="Case Status"
                                                        value="Resolved"
                                                    />

                                                    <InfoField
                                                        label="Resolved"
                                                        value={formatDateTime(
                                                            selectedCase.resolved_at
                                                        )}
                                                    />
                                                </div>
                                            </section>


                                            {/* INCIDENT INFORMATION */}

                                            {problemDetailFields.length >
                                                0 && (
                                                    <section>
                                                        <SectionTitle>
                                                            Incident Information
                                                        </SectionTitle>

                                                        <div
                                                            className="
                                                overflow-hidden

                                                rounded-[5px]

                                                border
                                                border-[#dce4de]

                                                bg-white
                                            "
                                                        >
                                                            {problemDetailFields.map(
                                                                (
                                                                    [label, value],
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={label}
                                                                        className="
                                                            grid
                                                            grid-cols-1
                                                            gap-2

                                                            px-5
                                                            py-4

                                                            border-b
                                                            border-[#e8ede9]

                                                            last:border-b-0

                                                            sm:grid-cols-[230px_1fr]

                                                            hover:bg-[#f9fbfa]
                                                        "
                                                                    >
                                                                        <span
                                                                            className="
                                                                text-[#718078]
                                                                text-[10px]
                                                                font-extrabold
                                                                tracking-[0.12em]
                                                            "
                                                                        >
                                                                            {label}
                                                                        </span>

                                                                        <span
                                                                            className="
                                                                break-words

                                                                text-[#33423a]
                                                                text-[13px]
                                                                leading-[1.6]
                                                                font-semibold
                                                            "
                                                                        >
                                                                            {formatDisplayValue(
                                                                                value
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </section>
                                                )}


                                            {/* REPORT DESCRIPTION */}

                                            {hasEnteredValue(
                                                selectedCase.report_text
                                            ) && (
                                                    <section>
                                                        <SectionTitle>
                                                            Problem Description
                                                        </SectionTitle>

                                                        <DetailBox>
                                                            {
                                                                selectedCase.report_text
                                                            }
                                                        </DetailBox>
                                                    </section>
                                                )}


                                            {/* ACTUAL OUTCOME */}

                                            {hasEnteredValue(
                                                selectedCase.actual_outcome
                                            ) && (
                                                    <section>
                                                        <SectionTitle>
                                                            Actual Outcome
                                                        </SectionTitle>

                                                        <DetailBox>
                                                            {
                                                                selectedCase.actual_outcome
                                                            }
                                                        </DetailBox>
                                                    </section>
                                                )}


                                            {/* POST INCIDENT */}

                                            {hasEnteredValue(
                                                selectedCase.post_incident_measures
                                            ) && (
                                                    <section>
                                                        <SectionTitle>
                                                            Post-Incident Measures
                                                        </SectionTitle>

                                                        <DetailBox>
                                                            {
                                                                selectedCase.post_incident_measures
                                                            }
                                                        </DetailBox>
                                                    </section>
                                                )}


                                            {/* ATTACHMENTS */}

                                            {selectedCase.attachments?.length >
                                                0 && (
                                                    <section>
                                                        <SectionTitle>
                                                            Attachments
                                                        </SectionTitle>

                                                        <div className="space-y-2">
                                                            {selectedCase.attachments.map(
                                                                (
                                                                    attachment,
                                                                    index
                                                                ) => (
                                                                    <a
                                                                        key={
                                                                            attachment._id ||
                                                                            attachment.url ||
                                                                            index
                                                                        }
                                                                        href={
                                                                            attachment.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="
                                                            flex
                                                            items-center
                                                            justify-between

                                                            gap-4

                                                            p-4

                                                            rounded-[5px]

                                                            border
                                                            border-[#dce4de]

                                                            bg-[#f9fbfa]

                                                            no-underline

                                                            hover:bg-[#f2f7f4]
                                                        "
                                                                    >
                                                                        <span
                                                                            className="
                                                                truncate

                                                                text-[#33423a]
                                                                text-[13px]
                                                                font-semibold
                                                            "
                                                                        >
                                                                            {
                                                                                attachment.name
                                                                            }
                                                                        </span>

                                                                        <span
                                                                            className="
                                                                shrink-0

                                                                text-[#087542]
                                                                text-[11px]
                                                                font-extrabold
                                                            "
                                                                        >
                                                                            Open →
                                                                        </span>
                                                                    </a>
                                                                )
                                                            )}
                                                        </div>
                                                    </section>
                                                )}
                                        </>
                                    )}
                                </div>
                            )}


                            {/* =================================================
                    TAB 2 — TEAM PROPOSAL
                ================================================= */}

                            {activeTab === "proposal" && (
                                <div
                                    className="
                            px-8
                            py-8

                            space-y-8
                        "
                                >

                                    {proposalLoading ? (
                                        <LoadingBlock
                                            text="Loading assigned team proposal..."
                                        />
                                    ) : !assignedProposal ? (
                                        <div
                                            className="
                                    p-8

                                    rounded-[5px]

                                    border
                                    border-[#dce4de]

                                    bg-[#f9fbfa]

                                    text-center
                                "
                                        >
                                            <div
                                                className="
                                        mx-auto

                                        w-12
                                        h-12

                                        flex
                                        items-center
                                        justify-center

                                        rounded-full

                                        bg-[#edf3ef]

                                        text-[#718078]
                                        text-[20px]
                                    "
                                            >
                                                —
                                            </div>

                                            <h3
                                                className="
                                        mt-5

                                        text-[#17211b]
                                        text-[18px]
                                        font-extrabold
                                    "
                                            >
                                                Assigned proposal unavailable
                                            </h3>

                                            <p
                                                className="
                                        max-w-[480px]

                                        mx-auto
                                        mt-2

                                        text-[#718078]
                                        text-[13px]
                                        leading-[1.7]
                                    "
                                            >
                                                The team assigned to this
                                                resolved case could not be
                                                matched to a stored proposal.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* ASSIGNMENT SUMMARY */}

                                            <section>
                                                <SectionTitle>
                                                    Assigned Team
                                                </SectionTitle>

                                                <div
                                                    className="
                                            grid
                                            grid-cols-1
                                            gap-4

                                            sm:grid-cols-2
                                            lg:grid-cols-4
                                        "
                                                >
                                                    <InfoField
                                                        label="Team"
                                                        value={
                                                            assignedProposal.team_name ||
                                                            selectedCase.assigned_team
                                                        }
                                                    />

                                                    <InfoField
                                                        label="Team ID"
                                                        value={
                                                            assignedProposal.team_id
                                                        }
                                                    />

                                                    <InfoField
                                                        label="Team Leader Email"
                                                        value={
                                                            assignedProposal.team_leader_email
                                                        }
                                                    />

                                                    <InfoField
                                                        label="Submitted"
                                                        value={formatDateTime(
                                                            assignedProposal.createdAt
                                                        )}
                                                    />
                                                </div>
                                            </section>


                                            {/* PROPOSAL */}

                                            {hasEnteredValue(
                                                assignedProposal.solution_proposal
                                            ) && (
                                                    <section>
                                                        <SectionTitle>
                                                            Team Proposal
                                                        </SectionTitle>

                                                        <DetailBox>
                                                            {
                                                                assignedProposal.solution_proposal
                                                            }
                                                        </DetailBox>
                                                    </section>
                                                )}


                                            {/* PROPOSAL ATTACHMENTS */}

                                            {assignedProposal.attachments?.length >
                                                0 && (
                                                    <section>
                                                        <SectionTitle>
                                                            Proposal Attachments
                                                        </SectionTitle>

                                                        <div className="space-y-2">
                                                            {assignedProposal.attachments.map(
                                                                (
                                                                    attachment,
                                                                    index
                                                                ) => (
                                                                    <a
                                                                        key={
                                                                            attachment._id ||
                                                                            attachment.url ||
                                                                            index
                                                                        }
                                                                        href={
                                                                            attachment.url
                                                                        }
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="
                                                            flex
                                                            items-center
                                                            justify-between

                                                            gap-4

                                                            p-4

                                                            rounded-[5px]

                                                            border
                                                            border-[#dce4de]

                                                            bg-[#f9fbfa]

                                                            no-underline

                                                            hover:bg-[#f2f7f4]
                                                        "
                                                                    >
                                                                        <span
                                                                            className="
                                                                truncate

                                                                text-[#33423a]
                                                                text-[13px]
                                                                font-semibold
                                                            "
                                                                        >
                                                                            {
                                                                                attachment.name
                                                                            }
                                                                        </span>

                                                                        <span
                                                                            className="
                                                                shrink-0

                                                                text-[#087542]
                                                                text-[11px]
                                                                font-extrabold
                                                            "
                                                                        >
                                                                            Open →
                                                                        </span>
                                                                    </a>
                                                                )
                                                            )}
                                                        </div>
                                                    </section>
                                                )}
                                        </>
                                    )}
                                </div>
                            )}


                            {/* =================================================
                    TAB 3 — SOLUTIONS
                ================================================= */}

                            {activeTab === "solutions" && (
                                <div
                                    className="
                            px-8
                            py-8
                        "
                                >

                                    <div
                                        className="
                                flex
                                items-center
                                justify-between

                                gap-4

                                mb-6
                            "
                                    >
                                        <div>
                                            <SectionTitle>
                                                Solutions Offered
                                            </SectionTitle>

                                            <p
                                                className="
                                        mt-[-12px]

                                        text-[#718078]
                                        text-[12px]
                                    "
                                            >
                                                Complete solution history
                                                for this resolved case.
                                            </p>
                                        </div>

                                        <span
                                            className="
                                    shrink-0

                                    px-3
                                    py-1.5

                                    rounded-full

                                    bg-[#eaf4ee]

                                    text-[#087542]
                                    text-[10px]
                                    font-extrabold
                                "
                                        >
                                            {solutions.length}
                                        </span>
                                    </div>


                                    {solutionsError && (
                                        <div
                                            className="
                                    p-5

                                    rounded-[5px]

                                    border
                                    border-[#f0cccc]

                                    bg-[#fff6f6]

                                    text-[#c62828]
                                    text-[13px]
                                    font-bold
                                "
                                        >
                                            {solutionsError}
                                        </div>
                                    )}


                                    {!solutionsError &&
                                        solutions.length === 0 && (
                                            <div
                                                className="
                                        p-8

                                        rounded-[5px]

                                        border
                                        border-[#dce4de]

                                        bg-[#f9fbfa]

                                        text-[#718078]
                                        text-[13px]

                                        text-center
                                    "
                                            >
                                                No solution history was found
                                                for this case.
                                            </div>
                                        )}


                                    {solutions.length > 0 && (
                                        <div className="space-y-5">
                                            {solutions.map(
                                                (solution) => (
                                                    <div
                                                        key={
                                                            solution.solution_id
                                                        }
                                                        className="
                                                overflow-hidden

                                                rounded-[5px]

                                                border
                                                border-[#dce4de]

                                                bg-white
                                            "
                                                    >
                                                        {/* SOLUTION HEADER */}

                                                        <div
                                                            className="
                                                    flex
                                                    flex-col

                                                    gap-3

                                                    p-6

                                                    border-b
                                                    border-[#e6ebe7]

                                                    md:flex-row
                                                    md:items-start
                                                    md:justify-between
                                                "
                                                        >
                                                            <div>
                                                                <span
                                                                    className="
                                                            block

                                                            text-[#718078]
                                                            text-[10px]
                                                            font-extrabold
                                                            tracking-[0.12em]
                                                        "
                                                                >
                                                                    REVIEW CYCLE
                                                                </span>

                                                                <h4
                                                                    className="
                                                            mt-2

                                                            text-[#17211b]
                                                            text-[20px]
                                                            font-extrabold
                                                        "
                                                                >
                                                                    Cycle{" "}
                                                                    {
                                                                        solution.review_cycle ||
                                                                        1
                                                                    }
                                                                </h4>

                                                                <p
                                                                    className="
                                                            mt-2

                                                            text-[#087542]
                                                            text-[11px]
                                                            font-extrabold
                                                        "
                                                                >
                                                                    {
                                                                        solution.solution_id
                                                                    }
                                                                </p>
                                                            </div>

                                                            <span
                                                                className="
                                                        w-fit

                                                        px-3
                                                        py-1.5

                                                        rounded-full

                                                        bg-[#eaf4ee]

                                                        text-[#087542]
                                                        text-[10px]
                                                        font-extrabold
                                                    "
                                                            >
                                                                {
                                                                    solution.status
                                                                }
                                                            </span>
                                                        </div>


                                                        {/* SOLUTION BODY */}

                                                        <div
                                                            className="
                                                    p-6

                                                    space-y-5
                                                "
                                                        >
                                                            <div
                                                                className="
                                                        grid
                                                        grid-cols-1

                                                        gap-4

                                                        sm:grid-cols-2
                                                    "
                                                            >
                                                                <InfoField
                                                                    label="Solution ID"
                                                                    value={
                                                                        solution.solution_id
                                                                    }
                                                                />

                                                                <InfoField
                                                                    label="Review Cycle"
                                                                    value={
                                                                        solution.review_cycle ||
                                                                        1
                                                                    }
                                                                />
                                                            </div>


                                                            <div>
                                                                <span
                                                                    className="
                                                            block
                                                            mb-2

                                                            text-[#718078]
                                                            text-[10px]
                                                            font-extrabold
                                                            tracking-[0.12em]
                                                        "
                                                                >
                                                                    SOLUTION
                                                                </span>

                                                                <DetailBox>
                                                                    {
                                                                        solution.solution_text
                                                                    }
                                                                </DetailBox>
                                                            </div>


                                                            {solution.attachments?.length >
                                                                0 && (
                                                                    <div>
                                                                        <span
                                                                            className="
                                                                block
                                                                mb-3

                                                                text-[#718078]
                                                                text-[10px]
                                                                font-extrabold
                                                                tracking-[0.12em]
                                                            "
                                                                        >
                                                                            ATTACHMENTS
                                                                        </span>

                                                                        <div className="space-y-2">
                                                                            {solution.attachments.map(
                                                                                (
                                                                                    attachment,
                                                                                    index
                                                                                ) => (
                                                                                    <a
                                                                                        key={
                                                                                            attachment._id ||
                                                                                            attachment.url ||
                                                                                            index
                                                                                        }
                                                                                        href={
                                                                                            attachment.url
                                                                                        }
                                                                                        target="_blank"
                                                                                        rel="noreferrer"
                                                                                        className="
                                                                            flex
                                                                            items-center
                                                                            justify-between

                                                                            gap-4

                                                                            p-4

                                                                            rounded-[4px]

                                                                            border
                                                                            border-[#dce4de]

                                                                            bg-[#f9fbfa]

                                                                            no-underline

                                                                            hover:bg-white
                                                                        "
                                                                                    >
                                                                                        <span
                                                                                            className="
                                                                                truncate

                                                                                text-[#33423a]
                                                                                text-[13px]
                                                                                font-semibold
                                                                            "
                                                                                        >
                                                                                            {
                                                                                                attachment.name
                                                                                            }
                                                                                        </span>

                                                                                        <span
                                                                                            className="
                                                                                shrink-0

                                                                                text-[#087542]
                                                                                text-[11px]
                                                                                font-extrabold
                                                                            "
                                                                                        >
                                                                                            Open →
                                                                                        </span>
                                                                                    </a>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}


/* =============================================================
   TABLE HEADER
============================================================= */

function TableHeader({ children }) {

    return (
        <span
            className="
                text-[#718078]

                text-[9px]
                font-extrabold

                tracking-[0.14em]
            "
        >
            {children}
        </span>
    );
}

/* =============================================================
   SECTION TITLE
============================================================= */

function SectionTitle({ children }) {
    return (
        <div className="mb-5">
            <h3
                className="
                    text-[#17211b]
                    text-[18px]
                    font-extrabold
                "
            >
                {children}
            </h3>

            <div
                className="
                    mt-3

                    w-8
                    h-[2px]

                    bg-[#087542]
                "
            />
        </div>
    );
}


/* =============================================================
   DETAIL BOX
============================================================= */

function DetailBox({ children }) {
    return (
        <div
            className="
                p-5

                rounded-[5px]

                border
                border-[#dce5df]

                bg-[#f9fbfa]

                text-[#46534b]
                text-[13px]
                leading-[1.75]

                whitespace-pre-wrap
            "
        >
            {children}
        </div>
    );
}


/* =============================================================
   LOADING BLOCK
============================================================= */

function LoadingBlock({ text }) {
    return (
        <div
            className="
                py-16

                flex
                flex-col
                items-center
            "
        >
            <div
                className="
                    w-9
                    h-9

                    rounded-full

                    border-4
                    border-[#dce8e0]
                    border-t-[#087542]

                    animate-spin
                "
            />

            <p
                className="
                    mt-4

                    text-[#718078]
                    text-[13px]
                "
            >
                {text}
            </p>
        </div>
    );
}

/* =============================================================
   INFO FIELD
============================================================= */

function InfoField({ label, value }) {

    return (
        <div
            className="
                p-5

                rounded-[5px]

                border
                border-[#e2e9e4]

                bg-[#f9fbfa]
            "
        >

            <span
                className="
                    block

                    mb-2

                    text-[#718078]

                    text-[10px]
                    font-extrabold

                    tracking-[0.12em]
                "
            >
                {label}
            </span>

            <span
                className="
                    block

                    break-all

                    text-[#33423a]

                    text-[14px]
                    leading-[1.5]

                    font-semibold
                "
            >
                {value || "Not stated"}
            </span>

        </div>
    );
}


export default AdminPastCaseHistory;