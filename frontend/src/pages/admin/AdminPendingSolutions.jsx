import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

import api from "../../api/axios";

import {
    getSolutionsForProposal,
    approveSolution,
    requestSolutionChanges,
} from "../../api/solution.api";

import {
    getProblemReportById,
} from "../../api/problemReport.api";

import {
    getProposalsForReport,
} from "../../api/teamProposal.api";


function AdminPendingSolutions() {

    const [solutions, setSolutions] = useState([]);

    const [selectedSolution, setSelectedSolution] =
        useState(null);

    const [solutionHistory, setSolutionHistory] =
        useState([]);

    const [activeTab, setActiveTab] =
        useState("solutions");

    const [selectedProblem, setSelectedProblem] =
        useState(null);

    const [assignedProposal, setAssignedProposal] =
        useState(null);

    const [problemLoading, setProblemLoading] =
        useState(false);

    const [proposalLoading, setProposalLoading] =
        useState(false);

    const [problemError, setProblemError] =
        useState("");

    const [proposalError, setProposalError] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [historyLoading, setHistoryLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [historyError, setHistoryError] =
        useState("");

    const [actionError, setActionError] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState(false);

    const [adminFeedback, setAdminFeedback] =
        useState("");


    /* =========================================================
       LOAD PENDING SOLUTIONS
    ========================================================= */

    const loadSolutions = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/pending-solutions"
            );

            setSolutions(
                response?.data?.data || []
            );

        } catch (err) {

            console.error(
                "Load pending solutions error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load pending solutions."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadSolutions();
    }, []);


    /* =========================================================
   OPEN SOLUTION
========================================================= */

    const handleOpenSolution =
        async (solution) => {

            setSelectedSolution(solution);

            // Automatically open tab 3
            setActiveTab("solutions");

            setSolutionHistory([]);
            setSelectedProblem(null);
            setAssignedProposal(null);

            setHistoryLoading(true);
            setProblemLoading(true);
            setProposalLoading(true);

            setHistoryError("");
            setProblemError("");
            setProposalError("");
            setActionError("");
            setAdminFeedback("");


            /* =================================================
               LOAD SOLUTION HISTORY
            ================================================= */

            getSolutionsForProposal(
                solution.proposal_id
            )
                .then((response) => {
                    setSolutionHistory(
                        response?.data || []
                    );
                })
                .catch((err) => {

                    console.error(
                        "Load solution history error:",
                        err
                    );

                    setHistoryError(
                        err?.response?.data?.message ||
                        "Unable to load solution history."
                    );

                })
                .finally(() => {
                    setHistoryLoading(false);
                });


            /* =================================================
               LOAD PROBLEM DETAIL
            ================================================= */

            getProblemReportById(
                solution.report_id
            )
                .then((response) => {

                    setSelectedProblem(
                        response?.data || null
                    );

                })
                .catch((err) => {

                    console.error(
                        "Load problem detail error:",
                        err
                    );

                    setProblemError(
                        err?.response?.data?.message ||
                        "Unable to load problem details."
                    );

                })
                .finally(() => {
                    setProblemLoading(false);
                });


            /* =================================================
               LOAD ASSIGNED TEAM PROPOSAL
            ================================================= */

            getProposalsForReport(
                solution.report_id
            )
                .then((response) => {

                    const proposals =
                        response?.data || [];

                    const matchingProposal =
                        proposals.find(
                            (proposal) =>
                                proposal.proposal_id ===
                                solution.proposal_id
                        );

                    setAssignedProposal(
                        matchingProposal || null
                    );

                })
                .catch((err) => {

                    console.error(
                        "Load assigned proposal error:",
                        err
                    );

                    setProposalError(
                        err?.response?.data?.message ||
                        "Unable to load the assigned team proposal."
                    );

                })
                .finally(() => {
                    setProposalLoading(false);
                });
        };


    /* =========================================================
   CLOSE MODAL
========================================================= */

    const handleClose = () => {

        if (actionLoading) {
            return;
        }

        setSelectedSolution(null);

        setSolutionHistory([]);

        setSelectedProblem(null);

        setAssignedProposal(null);

        setActiveTab("solutions");

        setHistoryError("");

        setProblemError("");

        setProposalError("");

        setActionError("");

        setAdminFeedback("");
    };


    /* =========================================================
       APPROVE
    ========================================================= */

    const handleApprove =
        async () => {

            if (!selectedSolution) {
                return;
            }

            const confirmed =
                window.confirm(
                    "Approve this solution and mark the case as resolved?"
                );

            if (!confirmed) {
                return;
            }

            try {

                setActionLoading(true);

                setActionError("");

                await approveSolution(
                    selectedSolution.solution_id
                );

                setSelectedSolution(null);

                setSolutionHistory([]);

                await loadSolutions();

            } catch (err) {

                console.error(
                    "Approve solution error:",
                    err
                );

                setActionError(
                    err?.response?.data?.message ||
                    "Unable to approve this solution."
                );

            } finally {

                setActionLoading(false);

            }
        };


    /* =========================================================
       REQUEST CHANGES
    ========================================================= */

    const handleRequestChanges =
        async () => {

            if (!selectedSolution) {
                return;
            }

            if (!adminFeedback.trim()) {

                setActionError(
                    "Please provide feedback before requesting changes."
                );

                return;
            }

            try {

                setActionLoading(true);

                setActionError("");

                await requestSolutionChanges(
                    selectedSolution.solution_id,
                    adminFeedback.trim()
                );

                setSelectedSolution(null);

                setSolutionHistory([]);

                setAdminFeedback("");

                await loadSolutions();

            } catch (err) {

                console.error(
                    "Request solution changes error:",
                    err
                );

                setActionError(
                    err?.response?.data?.message ||
                    "Unable to request changes."
                );

            } finally {

                setActionLoading(false);

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


    /* =========================================================
       STATUS LABEL
    ========================================================= */

    const getStatusLabel = (status) => {

        switch (status) {

            case "pending_review":
                return "Waiting for Review";

            case "changes_requested":
                return "Changes Requested";

            case "approved":
                return "Approved";

            default:
                return status || "Unknown";

        }
    };


    const formatProblemValue = (value) => {

        if (value === true) {
            return "Yes";
        }

        if (value === false) {
            return "No";
        }

        if (Array.isArray(value)) {
            return value
                .map((item) =>
                    String(item)
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                        )
                )
                .join(", ");
        }

        if (typeof value === "string") {
            return value
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                );
        }

        return String(value);
    };


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
                    Loading pending solutions...
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

                <h1
                    className="
                        mt-5

                        text-[#17211b]

                        text-[26px]
                        font-extrabold
                    "
                >
                    Pending solutions unavailable
                </h1>

                <p
                    className="
                        max-w-[450px]

                        mt-3

                        text-[#718078]

                        text-[14px]
                        leading-[1.6]
                    "
                >
                    {error}
                </p>

                <button
                    type="button"
                    onClick={loadSolutions}
                    className="
                        mt-6

                        px-6
                        py-3

                        rounded-[3px]

                        border-0

                        bg-[#087542]

                        text-white

                        text-[12px]
                        font-extrabold

                        cursor-pointer

                        hover:bg-[#065c38]
                    "
                >
                    Try Again
                </button>

            </div>
        );
    }


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


            {/* =================================================
                WORKSPACE
            ================================================= */}

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

                    <section className="mb-10">

                        <p
                            className="
                                mb-3

                                text-[#087542]

                                text-[10px]
                                font-extrabold

                                tracking-[0.2em]
                            "
                        >
                            SOLUTION MANAGEMENT
                        </p>

                        <div
                            className="
                                flex
                                flex-col

                                gap-5

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
                                    Pending Solutions
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
                                    Review solutions submitted by
                                    assigned teams and decide whether
                                    changes are required or the case
                                    can be resolved.
                                </p>

                            </div>


                            <div
                                className="
                                    w-fit

                                    px-6
                                    py-5

                                    rounded-[5px]

                                    border
                                    border-[#dce4de]

                                    bg-white

                                    shadow-[0_5px_20px_rgba(20,50,35,0.04)]
                                "
                            >

                                <span
                                    className="
                                        block

                                        text-[#718078]

                                        text-[10px]
                                        font-extrabold

                                        tracking-[0.15em]
                                    "
                                >
                                    WAITING FOR REVIEW
                                </span>

                                <strong
                                    className="
                                        block

                                        mt-2

                                        text-[#087542]

                                        text-[30px]
                                        leading-none

                                        font-extrabold
                                    "
                                >
                                    {solutions.length}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {solutions.length === 0 ? (

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
                                No solutions waiting for review
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
                                Submitted solutions will appear here
                                when a team sends a solution for admin
                                review.
                            </p>

                        </div>

                    ) : (

                        /* =================================================
                           SOLUTION LIST
                        ================================================= */

                        <div className="space-y-3">

                            {solutions.map(
                                (solution) => (

                                    <button
                                        key={
                                            solution.solution_id
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleOpenSolution(
                                                solution
                                            )
                                        }
                                        className="
                                            group

                                            w-full

                                            grid

                                            grid-cols-1

                                            gap-5

                                            p-6

                                            rounded-[5px]

                                            border
                                            border-[#dce4de]

                                            bg-white

                                            text-left

                                            shadow-[0_5px_20px_rgba(20,50,35,0.035)]

                                            cursor-pointer

                                            transition

                                            hover:-translate-y-[1px]
                                            hover:border-[#b8cec0]
                                            hover:shadow-[0_10px_25px_rgba(20,50,35,0.07)]

                                            md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]

                                            md:items-center
                                        "
                                    >

                                        {/* SOLUTION */}

                                        <div>

                                            <span
                                                className="
                                                    block

                                                    text-[#718078]

                                                    text-[10px]
                                                    font-extrabold

                                                    tracking-[0.14em]
                                                "
                                            >
                                                SOLUTION
                                            </span>

                                            <strong
                                                className="
                                                    block

                                                    mt-2

                                                    text-[#17211b]

                                                    text-[15px]
                                                    font-extrabold
                                                "
                                            >
                                                {
                                                    solution.solution_id
                                                }
                                            </strong>

                                            <span
                                                className="
                                                    block

                                                    mt-1

                                                    text-[#087542]

                                                    text-[11px]
                                                    font-bold
                                                "
                                            >
                                                Cycle{" "}
                                                {
                                                    solution.review_cycle ||
                                                    1
                                                }
                                            </span>

                                        </div>


                                        {/* CASE */}

                                        <div>

                                            <span
                                                className="
                                                    block

                                                    text-[#718078]

                                                    text-[10px]
                                                    font-extrabold

                                                    tracking-[0.14em]
                                                "
                                            >
                                                CASE
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-2

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                    font-semibold
                                                "
                                            >
                                                {
                                                    solution.report_id
                                                }
                                            </span>

                                        </div>


                                        {/* TEAM */}

                                        <div>

                                            <span
                                                className="
                                                    block

                                                    text-[#718078]

                                                    text-[10px]
                                                    font-extrabold

                                                    tracking-[0.14em]
                                                "
                                            >
                                                TEAM
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-2

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                    font-semibold
                                                "
                                            >
                                                {
                                                    solution.team_id
                                                }
                                            </span>

                                        </div>


                                        {/* SUBMITTED */}

                                        <div>

                                            <span
                                                className="
                                                    block

                                                    text-[#718078]

                                                    text-[10px]
                                                    font-extrabold

                                                    tracking-[0.14em]
                                                "
                                            >
                                                SUBMITTED
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-2

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                    font-semibold
                                                "
                                            >
                                                {
                                                    formatDate(
                                                        solution.submitted_at
                                                    )
                                                }
                                            </span>

                                        </div>


                                        {/* STATUS */}

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between

                                                gap-4

                                                md:flex-col
                                                md:items-end
                                            "
                                        >

                                            <span
                                                className="
                                                    px-3
                                                    py-1.5

                                                    rounded-full

                                                    bg-[#fff8e8]

                                                    text-[#9a6b00]

                                                    text-[10px]
                                                    font-extrabold

                                                    whitespace-nowrap
                                                "
                                            >
                                                {
                                                    getStatusLabel(
                                                        solution.status
                                                    )
                                                }
                                            </span>

                                            <span
                                                className="
                                                    text-[#087542]

                                                    text-[12px]
                                                    font-extrabold

                                                    whitespace-nowrap

                                                    transition

                                                    group-hover:translate-x-1
                                                "
                                            >
                                                Review →
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
    SOLUTION REVIEW MODAL
================================================= */}

            {selectedSolution && (
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
                max-w-[1050px]

                max-h-[92vh]
                overflow-y-auto

                rounded-[6px]

                border
                border-[#dce4de]

                bg-white

                shadow-[0_25px_80px_rgba(20,50,35,0.22)]
            "
                    >

                        {/* =================================================
                HEADER
            ================================================= */}

                        <div
                            className="
                    sticky
                    top-0
                    z-30

                    flex
                    items-start
                    justify-between

                    gap-5

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
                                    SOLUTION REVIEW
                                </span>

                                <h2
                                    className="
                            text-[#17211b]

                            text-[30px]
                            leading-none

                            font-extrabold

                            tracking-[-0.04em]
                        "
                                >
                                    {selectedSolution.solution_id}
                                </h2>

                                <p
                                    className="
                            mt-2

                            text-[#718078]
                            text-[13px]
                        "
                                >
                                    Case{" "}
                                    {selectedSolution.report_id}
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={actionLoading}
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

                        disabled:opacity-50
                        disabled:cursor-not-allowed
                    "
                            >
                                ×
                            </button>

                        </div>


                        {/* =================================================
                SUMMARY
            ================================================= */}

                        <div
                            className="
                    px-7
                    pt-6
                "
                        >

                            <div
                                className="
                        overflow-hidden

                        rounded-[4px]

                        border
                        border-[#dce5df]
                    "
                            >

                                <div
                                    className="
                            grid
                            grid-cols-1

                            sm:grid-cols-2
                            lg:grid-cols-4
                        "
                                >

                                    {[
                                        [
                                            "CASE",
                                            selectedSolution.report_id,
                                        ],
                                        [
                                            "TEAM",
                                            selectedSolution.team_id,
                                        ],
                                        [
                                            "PROPOSAL",
                                            selectedSolution.proposal_id,
                                        ],
                                        [
                                            "SUBMITTED",
                                            formatDateTime(
                                                selectedSolution.submitted_at
                                            ),
                                        ],
                                    ].map(
                                        ([label, value], index) => (
                                            <div
                                                key={label}
                                                className={`
                                        px-4
                                        py-4

                                        bg-[#f7faf8]

                                        ${index <
                                                        3
                                                        ? "lg:border-r border-[#dce5df]"
                                                        : ""
                                                    }

                                        border-b
                                        lg:border-b-0
                                        last:border-b-0
                                        border-[#dce5df]
                                    `}
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
                                                    {label}
                                                </span>

                                                <strong
                                                    className="
                                            block

                                            text-[#17211b]
                                            text-[13px]
                                            font-bold

                                            break-all
                                        "
                                                >
                                                    {value || "—"}
                                                </strong>

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                TABS
            ================================================= */}

                        <div
                            className="
                    sticky
                    top-[105px]
                    z-20

                    mt-6

                    px-7

                    border-b
                    border-[#dce4de]

                    bg-white
                "
                        >

                            <div
                                className="
                        flex

                        overflow-x-auto
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

                                px-5
                                py-4

                                text-[10px]
                                font-extrabold

                                tracking-[0.1em]

                                cursor-pointer

                                transition

                                ${activeTab ===
                                                tab.id
                                                ? "text-[#087542]"
                                                : "text-[#718078] hover:text-[#17211b]"
                                            }

                                after:absolute
                                after:left-0
                                after:right-0
                                after:bottom-[-1px]
                                after:h-[2px]

                                ${activeTab ===
                                                tab.id
                                                ? "after:bg-[#087542]"
                                                : "after:bg-transparent"
                                            }
                            `}
                                    >
                                        {tab.label}
                                    </button>

                                ))}

                            </div>

                        </div>


                        {/* =================================================
                TAB CONTENT
            ================================================= */}

                        <div
                            className="
                    px-7
                    py-7
                "
                        >


                            {/* =================================================
                    PROBLEM DETAIL
                ================================================= */}

                            {activeTab === "problem" && (

                                <div>

                                    {problemLoading && (
                                        <div
                                            className="
                                    py-20

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
                                                Loading problem details...
                                            </p>

                                        </div>
                                    )}


                                    {!problemLoading &&
                                        problemError && (
                                            <div
                                                className="
                                        p-5

                                        rounded-[4px]

                                        border
                                        border-[#f0cccc]

                                        bg-[#fff6f6]

                                        text-[#c62828]
                                        text-[13px]
                                        font-bold
                                    "
                                            >
                                                {problemError}
                                            </div>
                                        )}


                                    {!problemLoading &&
                                        !problemError &&
                                        selectedProblem && (
                                            <div>

                                                {(() => {

                                                    const renderTable =
                                                        (fields) => {

                                                            const visible =
                                                                fields.filter(
                                                                    ([, value]) =>
                                                                        value !==
                                                                        undefined &&
                                                                        value !==
                                                                        null &&
                                                                        value !==
                                                                        "" &&
                                                                        value !==
                                                                        "NOT_STATED"
                                                                );

                                                            if (
                                                                visible.length ===
                                                                0
                                                            ) {
                                                                return null;
                                                            }

                                                            return (
                                                                <div
                                                                    className="
                                                            overflow-hidden

                                                            rounded-[4px]

                                                            border
                                                            border-[#dce5df]
                                                        "
                                                                >

                                                                    {visible.map(
                                                                        (
                                                                            [
                                                                                label,
                                                                                value,
                                                                            ],
                                                                            index
                                                                        ) => (

                                                                            <div
                                                                                key={
                                                                                    label
                                                                                }
                                                                                className={`
                                                                        grid
                                                                        grid-cols-1
                                                                        sm:grid-cols-[250px_1fr]

                                                                        ${index <
                                                                                        visible.length -
                                                                                        1
                                                                                        ? "border-b border-[#e3e9e5]"
                                                                                        : ""
                                                                                    }
                                                                    `}
                                                                            >

                                                                                <div
                                                                                    className="
                                                                            px-4
                                                                            py-3.5

                                                                            bg-[#f7faf8]

                                                                            text-[#718078]
                                                                            text-[9px]
                                                                            font-extrabold

                                                                            tracking-[0.1em]
                                                                        "
                                                                                >
                                                                                    {
                                                                                        label
                                                                                    }
                                                                                </div>

                                                                                <div
                                                                                    className="
                                                                            px-4
                                                                            py-3.5

                                                                            text-[#46534b]
                                                                            text-[13px]
                                                                            font-semibold
                                                                            leading-[1.6]

                                                                            break-words
                                                                        "
                                                                                >
                                                                                    {formatProblemValue(
                                                                                        value
                                                                                    )}
                                                                                </div>

                                                                            </div>

                                                                        )
                                                                    )}

                                                                </div>
                                                            );
                                                        };


                                                    const renderSection =
                                                        (
                                                            title,
                                                            fields
                                                        ) => {

                                                            const visible =
                                                                fields.filter(
                                                                    ([, value]) =>
                                                                        value !==
                                                                        undefined &&
                                                                        value !==
                                                                        null &&
                                                                        value !==
                                                                        "" &&
                                                                        value !==
                                                                        "NOT_STATED"
                                                                );

                                                            if (
                                                                visible.length ===
                                                                0
                                                            ) {
                                                                return null;
                                                            }

                                                            return (
                                                                <section className="mb-8">

                                                                    <div className="mb-3">

                                                                        <span
                                                                            className="
                                                                    block

                                                                    text-[#087542]
                                                                    text-[9px]
                                                                    font-extrabold

                                                                    tracking-[0.15em]
                                                                "
                                                                        >
                                                                            {title}
                                                                        </span>

                                                                        <div
                                                                            className="
                                                                    mt-2
                                                                    h-px
                                                                    bg-[#e3e9e5]
                                                                "
                                                                        />

                                                                    </div>

                                                                    {renderTable(
                                                                        visible
                                                                    )}

                                                                </section>
                                                            );
                                                        };


                                                    return (
                                                        <>

                                                            {renderSection(
                                                                "CASE OVERVIEW",
                                                                [
                                                                    [
                                                                        "REPORT TYPE",
                                                                        selectedProblem.report_type,
                                                                    ],
                                                                    [
                                                                        "REPORT DATE",
                                                                        selectedProblem.report_date
                                                                            ? formatDate(
                                                                                selectedProblem.report_date
                                                                            )
                                                                            : null,
                                                                    ],
                                                                    [
                                                                        "INCIDENT SERIAL NO.",
                                                                        selectedProblem.incident_serial_no,
                                                                    ],
                                                                    [
                                                                        "REPORT STAGE",
                                                                        selectedProblem.report_stage,
                                                                    ],
                                                                    [
                                                                        "INCIDENT CLASSIFICATION",
                                                                        selectedProblem.incident_classification,
                                                                    ],
                                                                    [
                                                                        "INCIDENT CATEGORY",
                                                                        selectedProblem.incident_category,
                                                                    ],
                                                                    [
                                                                        "INCIDENT TYPE",
                                                                        selectedProblem.incident_type,
                                                                    ],
                                                                ]
                                                            )}


                                                            {renderSection(
                                                                "INCIDENT INFORMATION",
                                                                [
                                                                    [
                                                                        "ORGANISATION",
                                                                        selectedProblem.organization,
                                                                    ],
                                                                    [
                                                                        "SECTOR",
                                                                        selectedProblem.sector,
                                                                    ],
                                                                    [
                                                                        "SITE",
                                                                        selectedProblem.site,
                                                                    ],
                                                                    [
                                                                        "INCIDENT TIME",
                                                                        selectedProblem.incident_time,
                                                                    ],
                                                                    [
                                                                        "INCIDENT LOCATION",
                                                                        selectedProblem.incident_location,
                                                                    ],
                                                                    [
                                                                        "ACTIVITY",
                                                                        selectedProblem.activity,
                                                                    ],
                                                                    [
                                                                        "LOCATION",
                                                                        selectedProblem.location,
                                                                    ],
                                                                    [
                                                                        "EQUIPMENT",
                                                                        selectedProblem.equipment,
                                                                    ],
                                                                    [
                                                                        "HAZARD",
                                                                        selectedProblem.hazard,
                                                                    ],
                                                                    [
                                                                        "ENERGY SOURCE",
                                                                        selectedProblem.energy_source,
                                                                    ],
                                                                    [
                                                                        "EXPOSURE",
                                                                        selectedProblem.exposure,
                                                                    ],
                                                                    [
                                                                        "UNSAFE ACT / CONDITION",
                                                                        selectedProblem.unsafe_act_condition,
                                                                    ],
                                                                    [
                                                                        "BARRIER / CONTROL",
                                                                        selectedProblem.barrier_or_control,
                                                                    ],
                                                                    [
                                                                        "BARRIER FAILURE MODE",
                                                                        selectedProblem.barrier_failure_mode,
                                                                    ],
                                                                    [
                                                                        "BARRIER FUNCTION",
                                                                        selectedProblem.barrier_function,
                                                                    ],
                                                                    [
                                                                        "POTENTIAL CONSEQUENCE",
                                                                        selectedProblem.potential_consequence,
                                                                    ],
                                                                ]
                                                            )}


                                                            {renderSection(
                                                                "FACILITY & FIRE DETAILS",
                                                                [
                                                                    [
                                                                        "FACILITY SHUTDOWN",
                                                                        selectedProblem.facility_shutdown,
                                                                    ],
                                                                    [
                                                                        "FACILITY OUTAGE",
                                                                        selectedProblem.facility_outage,
                                                                    ],
                                                                    [
                                                                        "FACILITY STATUS",
                                                                        selectedProblem.facility_status,
                                                                    ],
                                                                    [
                                                                        "FIRE DURATION (HOURS)",
                                                                        selectedProblem.fire_duration_hours,
                                                                    ],
                                                                    [
                                                                        "FIRE DURATION (MINUTES)",
                                                                        selectedProblem.fire_duration_minutes,
                                                                    ],
                                                                ]
                                                            )}


                                                            {renderSection(
                                                                "PEOPLE & LOSS",
                                                                [
                                                                    [
                                                                        "FATALITIES — EMPLOYEES",
                                                                        selectedProblem.fatalities?.employees,
                                                                    ],
                                                                    [
                                                                        "FATALITIES — CONTRACTORS",
                                                                        selectedProblem.fatalities?.contractors,
                                                                    ],
                                                                    [
                                                                        "FATALITIES — OTHERS",
                                                                        selectedProblem.fatalities?.others,
                                                                    ],
                                                                    [
                                                                        "INJURIES — EMPLOYEES",
                                                                        selectedProblem.injuries?.employees,
                                                                    ],
                                                                    [
                                                                        "INJURIES — CONTRACTORS",
                                                                        selectedProblem.injuries?.contractors,
                                                                    ],
                                                                    [
                                                                        "INJURIES — OTHERS",
                                                                        selectedProblem.injuries?.others,
                                                                    ],
                                                                    [
                                                                        "MAN HOURS LOST — EMPLOYEES",
                                                                        selectedProblem.man_hours_lost?.employees,
                                                                    ],
                                                                    [
                                                                        "MAN HOURS LOST — CONTRACTORS",
                                                                        selectedProblem.man_hours_lost?.contractors,
                                                                    ],
                                                                    [
                                                                        "MAN HOURS LOST — OTHERS",
                                                                        selectedProblem.man_hours_lost?.others,
                                                                    ],
                                                                    [
                                                                        "DIRECT LOSS (₹ LAKHS)",
                                                                        selectedProblem.direct_loss_in_lakhs,
                                                                    ],
                                                                    [
                                                                        "INDIRECT LOSS",
                                                                        selectedProblem.indirect_loss,
                                                                    ],
                                                                ]
                                                            )}


                                                            {renderSection(
                                                                "CAUSE & AVOIDABILITY",
                                                                [
                                                                    [
                                                                        "CAUSE OF INCIDENT",
                                                                        selectedProblem.cause_of_incident,
                                                                    ],
                                                                    [
                                                                        "LEAKAGE CAUSE",
                                                                        selectedProblem.leakage_cause,
                                                                    ],
                                                                    [
                                                                        "LEAKAGE CAUSE DETAILS",
                                                                        selectedProblem.leakage_cause_details,
                                                                    ],
                                                                    [
                                                                        "IGNITION CAUSE",
                                                                        selectedProblem.ignition_cause,
                                                                    ],
                                                                    [
                                                                        "IGNITION CAUSE DETAILS",
                                                                        selectedProblem.ignition_cause_details,
                                                                    ],
                                                                    [
                                                                        "AVOIDABLE",
                                                                        selectedProblem.avoidable,
                                                                    ],
                                                                    [
                                                                        "AVOIDANCE FACTORS",
                                                                        selectedProblem.avoidance_factors,
                                                                    ],
                                                                ]
                                                            )}


                                                            {renderSection(
                                                                "INVESTIGATION & FOLLOW-UP",
                                                                [
                                                                    [
                                                                        "SIMILAR INCIDENT OCCURRED",
                                                                        selectedProblem.similar_incident_occurred,
                                                                    ],
                                                                    [
                                                                        "SIMILAR INCIDENT DESCRIPTION",
                                                                        selectedProblem.similar_incident_description,
                                                                    ],
                                                                    [
                                                                        "INTERNAL INVESTIGATION COMPLETED",
                                                                        selectedProblem.internal_investigation_completed,
                                                                    ],
                                                                    [
                                                                        "INTERNAL INVESTIGATION COMPLETION DATE",
                                                                        selectedProblem.internal_investigation_completion_date
                                                                            ? formatDate(
                                                                                selectedProblem.internal_investigation_completion_date
                                                                            )
                                                                            : null,
                                                                    ],
                                                                    [
                                                                        "INVESTIGATION REPORT SUBMITTED TO OISD",
                                                                        selectedProblem.internal_investigation_report_submitted_to_oisd,
                                                                    ],
                                                                    [
                                                                        "EXPECTED OISD SUBMISSION DATE",
                                                                        selectedProblem.expected_oisd_submission_date
                                                                            ? formatDate(
                                                                                selectedProblem.expected_oisd_submission_date
                                                                            )
                                                                            : null,
                                                                    ],
                                                                ]
                                                            )}


                                                            {selectedProblem.report_text && (
                                                                <section className="mb-8">

                                                                    <div className="mb-3">

                                                                        <span
                                                                            className="
                                                                    block

                                                                    text-[#087542]
                                                                    text-[9px]
                                                                    font-extrabold

                                                                    tracking-[0.15em]
                                                                "
                                                                        >
                                                                            REPORT DESCRIPTION
                                                                        </span>

                                                                        <div
                                                                            className="
                                                                    mt-2
                                                                    h-px
                                                                    bg-[#e3e9e5]
                                                                "
                                                                        />

                                                                    </div>

                                                                    <div
                                                                        className="
                                                                px-5
                                                                py-4

                                                                rounded-[4px]

                                                                border
                                                                border-[#dce5df]

                                                                bg-[#fbfcfb]

                                                                text-[#46534b]
                                                                text-[13px]
                                                                leading-[1.75]

                                                                whitespace-pre-wrap
                                                            "
                                                                    >
                                                                        {
                                                                            selectedProblem.report_text
                                                                        }
                                                                    </div>

                                                                </section>
                                                            )}


                                                            {selectedProblem.actual_outcome && (
                                                                <section>

                                                                    <div className="mb-3">

                                                                        <span
                                                                            className="
                                                                    block

                                                                    text-[#087542]
                                                                    text-[9px]
                                                                    font-extrabold

                                                                    tracking-[0.15em]
                                                                "
                                                                        >
                                                                            ACTUAL OUTCOME
                                                                        </span>

                                                                        <div
                                                                            className="
                                                                    mt-2
                                                                    h-px
                                                                    bg-[#e3e9e5]
                                                                "
                                                                        />

                                                                    </div>

                                                                    <div
                                                                        className="
                                                                px-5
                                                                py-4

                                                                rounded-[4px]

                                                                border
                                                                border-[#dce5df]

                                                                bg-[#fbfcfb]

                                                                text-[#46534b]
                                                                text-[13px]
                                                                leading-[1.75]

                                                                whitespace-pre-wrap
                                                            "
                                                                    >
                                                                        {
                                                                            selectedProblem.actual_outcome
                                                                        }
                                                                    </div>

                                                                </section>
                                                            )}

                                                        </>
                                                    );

                                                })()}

                                            </div>
                                        )}

                                </div>
                            )}


                            {/* =================================================
                    TEAM PROPOSAL
                ================================================= */}

                            {activeTab === "proposal" && (

                                <div>

                                    {proposalLoading && (
                                        <div
                                            className="
                                    py-20

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
                                                Loading assigned proposal...
                                            </p>

                                        </div>
                                    )}


                                    {!proposalLoading &&
                                        proposalError && (
                                            <div
                                                className="
                                        p-5

                                        rounded-[4px]

                                        border
                                        border-[#f0cccc]

                                        bg-[#fff6f6]

                                        text-[#c62828]
                                        text-[13px]
                                        font-bold
                                    "
                                            >
                                                {proposalError}
                                            </div>
                                        )}


                                    {!proposalLoading &&
                                        !proposalError &&
                                        !assignedProposal && (
                                            <div
                                                className="
                                        p-8

                                        rounded-[4px]

                                        border
                                        border-[#dce4de]

                                        bg-[#f9fbfa]

                                        text-[#718078]
                                        text-[13px]

                                        text-center
                                    "
                                            >
                                                No matching team proposal was found
                                                for this solution.
                                            </div>
                                        )}


                                    {!proposalLoading &&
                                        !proposalError &&
                                        assignedProposal && (

                                            <div>

                                                {/* =================================================
                                        ASSIGNED TEAM
                                    ================================================= */}

                                                <section className="mb-8">

                                                    <div className="mb-3">

                                                        <span
                                                            className="
                                                    block

                                                    text-[#087542]
                                                    text-[9px]
                                                    font-extrabold

                                                    tracking-[0.15em]
                                                "
                                                        >
                                                            ASSIGNED TEAM
                                                        </span>

                                                        <div
                                                            className="
                                                    mt-2
                                                    h-px
                                                    bg-[#e3e9e5]
                                                "
                                                        />

                                                    </div>

                                                    <div
                                                        className="
                                                overflow-hidden

                                                rounded-[4px]

                                                border
                                                border-[#dce5df]
                                            "
                                                    >

                                                        {[
                                                            [
                                                                "TEAM",
                                                                assignedProposal.team_name ||
                                                                assignedProposal.team_id,
                                                            ],
                                                            [
                                                                "TEAM ID",
                                                                assignedProposal.team_id,
                                                            ],
                                                            [
                                                                "TEAM LEADER EMAIL",
                                                                assignedProposal.team_leader_email,
                                                            ],
                                                            [
                                                                "PROPOSAL ID",
                                                                assignedProposal.proposal_id,
                                                            ],
                                                            [
                                                                "SUBMITTED",
                                                                formatDateTime(
                                                                    assignedProposal.createdAt
                                                                ),
                                                            ],
                                                            [
                                                                "STATUS",
                                                                assignedProposal.status,
                                                            ],
                                                        ]
                                                            .filter(
                                                                ([, value]) =>
                                                                    value !==
                                                                    undefined &&
                                                                    value !==
                                                                    null &&
                                                                    value !==
                                                                    ""
                                                            )
                                                            .map(
                                                                (
                                                                    [
                                                                        label,
                                                                        value,
                                                                    ],
                                                                    index,
                                                                    array
                                                                ) => (

                                                                    <div
                                                                        key={
                                                                            label
                                                                        }
                                                                        className={`
                                                                grid
                                                                grid-cols-1
                                                                sm:grid-cols-[250px_1fr]

                                                                ${index <
                                                                                array.length -
                                                                                1
                                                                                ? "border-b border-[#e3e9e5]"
                                                                                : ""
                                                                            }
                                                            `}
                                                                    >

                                                                        <div
                                                                            className="
                                                                    px-4
                                                                    py-3.5

                                                                    bg-[#f7faf8]

                                                                    text-[#718078]
                                                                    text-[9px]
                                                                    font-extrabold

                                                                    tracking-[0.1em]
                                                                "
                                                                        >
                                                                            {
                                                                                label
                                                                            }
                                                                        </div>

                                                                        <div
                                                                            className="
                                                                    px-4
                                                                    py-3.5

                                                                    text-[#46534b]
                                                                    text-[13px]
                                                                    font-semibold

                                                                    break-words
                                                                "
                                                                        >
                                                                            {formatProblemValue(
                                                                                value
                                                                            )}
                                                                        </div>

                                                                    </div>

                                                                )
                                                            )}

                                                    </div>

                                                </section>


                                                {/* =================================================
                                        TEAM PROPOSAL
                                    ================================================= */}

                                                {assignedProposal.solution_proposal && (

                                                    <section>

                                                        <div className="mb-3">

                                                            <span
                                                                className="
                                                        block

                                                        text-[#087542]
                                                        text-[9px]
                                                        font-extrabold

                                                        tracking-[0.15em]
                                                    "
                                                            >
                                                                TEAM PROPOSAL
                                                            </span>

                                                            <div
                                                                className="
                                                        mt-2
                                                        h-px
                                                        bg-[#e3e9e5]
                                                    "
                                                            />

                                                        </div>

                                                        <div
                                                            className="
                                                    px-5
                                                    py-5

                                                    rounded-[4px]

                                                    border
                                                    border-[#dce5df]

                                                    bg-[#fbfcfb]

                                                    text-[#46534b]
                                                    text-[13px]
                                                    leading-[1.8]

                                                    whitespace-pre-wrap
                                                "
                                                        >
                                                            {
                                                                assignedProposal.solution_proposal
                                                            }
                                                        </div>

                                                    </section>
                                                )}

                                            </div>
                                        )}

                                </div>
                            )}


                            {/* =================================================
                    SOLUTIONS
                ================================================= */}

                            {activeTab === "solutions" && (

                                <div>

                                    <div
                                        className="
                                flex
                                items-center
                                justify-between

                                gap-4

                                mb-5
                            "
                                    >

                                        <div>

                                            <span
                                                className="
                                        block

                                        text-[#087542]
                                        text-[9px]
                                        font-extrabold

                                        tracking-[0.15em]
                                    "
                                            >
                                                SOLUTION HISTORY
                                            </span>

                                            <h3
                                                className="
                                        mt-2

                                        text-[#17211b]
                                        text-[20px]
                                        font-extrabold
                                    "
                                            >
                                                Submitted Solutions
                                            </h3>

                                        </div>

                                        <span
                                            className="
                                    shrink-0

                                    px-3
                                    py-1.5

                                    rounded-full

                                    bg-[#eaf4ee]

                                    text-[#087542]
                                    text-[11px]
                                    font-extrabold
                                "
                                        >
                                            {
                                                solutionHistory.length
                                            }{" "}
                                            {solutionHistory.length ===
                                                1
                                                ? "submission"
                                                : "submissions"}
                                        </span>

                                    </div>


                                    {/* =================================================
                            EXISTING HISTORY
                        ================================================= */}

                                    {historyLoading && (
                                        <div
                                            className="
                                    py-12

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
                                                Loading solution history...
                                            </p>

                                        </div>
                                    )}


                                    {!historyLoading &&
                                        historyError && (
                                            <div
                                                className="
                                        p-5

                                        rounded-[4px]

                                        border
                                        border-[#f0cccc]

                                        bg-[#fff6f6]

                                        text-[#c62828]
                                        text-[13px]
                                        font-bold
                                    "
                                            >
                                                {historyError}
                                            </div>
                                        )}


                                    {!historyLoading &&
                                        !historyError &&
                                        solutionHistory.length ===
                                        0 && (
                                            <div
                                                className="
                                        p-8

                                        rounded-[4px]

                                        border
                                        border-[#dce4de]

                                        bg-[#f9fbfa]

                                        text-[#718078]
                                        text-[13px]

                                        text-center
                                    "
                                            >
                                                No solution history found.
                                            </div>
                                        )}


                                    {!historyLoading &&
                                        !historyError &&
                                        solutionHistory.length >
                                        0 && (

                                            <div className="space-y-5">

                                                {solutionHistory.map(
                                                    (historyItem) => (

                                                        <div
                                                            key={
                                                                historyItem.solution_id
                                                            }
                                                            className="
                                                    overflow-hidden

                                                    rounded-[5px]

                                                    border
                                                    border-[#dce4de]

                                                    bg-white
                                                "
                                                        >

                                                            {/* CYCLE HEADER */}

                                                            <div
                                                                className="
                                                        flex
                                                        flex-col

                                                        gap-3

                                                        md:flex-row
                                                        md:items-center
                                                        md:justify-between

                                                        px-5
                                                        py-4

                                                        bg-[#f7faf8]

                                                        border-b
                                                        border-[#e3e9e5]
                                                    "
                                                            >

                                                                <div>

                                                                    <span
                                                                        className="
                                                                block

                                                                text-[#718078]
                                                                text-[9px]
                                                                font-extrabold

                                                                tracking-[0.14em]
                                                            "
                                                                    >
                                                                        REVIEW CYCLE
                                                                    </span>

                                                                    <strong
                                                                        className="
                                                                block
                                                                mt-1

                                                                text-[#17211b]
                                                                text-[17px]
                                                                font-extrabold
                                                            "
                                                                    >
                                                                        Cycle{" "}
                                                                        {
                                                                            historyItem.review_cycle ||
                                                                            1
                                                                        }
                                                                    </strong>

                                                                </div>


                                                                <span
                                                                    className="
                                                            w-fit

                                                            px-3
                                                            py-1.5

                                                            rounded-full

                                                            bg-[#fff8e8]

                                                            text-[#9a6b00]
                                                            text-[10px]
                                                            font-extrabold
                                                        "
                                                                >
                                                                    {
                                                                        getStatusLabel(
                                                                            historyItem.status
                                                                        )
                                                                    }
                                                                </span>

                                                            </div>


                                                            {/* SOLUTION */}

                                                            <div className="p-5">

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
                                                                    SOLUTION
                                                                </span>

                                                                <div
                                                                    className="
                                                            px-5
                                                            py-4

                                                            rounded-[4px]

                                                            border
                                                            border-[#dce5df]

                                                            bg-[#fbfcfb]

                                                            text-[#46534b]
                                                            text-[13px]
                                                            leading-[1.8]

                                                            whitespace-pre-wrap
                                                        "
                                                                >
                                                                    {
                                                                        historyItem.solution_text
                                                                    }
                                                                </div>


                                                                {/* ATTACHMENTS */}

                                                                {historyItem.attachments?.length >
                                                                    0 && (

                                                                        <div className="mt-5">

                                                                            <span
                                                                                className="
                                                                    block
                                                                    mb-3

                                                                    text-[#718078]
                                                                    text-[9px]
                                                                    font-extrabold

                                                                    tracking-[0.12em]
                                                                "
                                                                            >
                                                                                ATTACHMENTS
                                                                            </span>

                                                                            <div className="space-y-2">

                                                                                {historyItem.attachments.map(
                                                                                    (
                                                                                        attachment,
                                                                                        index
                                                                                    ) => (

                                                                                        <a
                                                                                            key={
                                                                                                attachment._id ||
                                                                                                `${attachment.name}-${index}`
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

                                                                                px-4
                                                                                py-3

                                                                                rounded-[4px]

                                                                                border
                                                                                border-[#dce4de]

                                                                                bg-white

                                                                                no-underline

                                                                                hover:bg-[#f5f8f6]
                                                                            "
                                                                                        >

                                                                                            <div className="min-w-0">

                                                                                                <span
                                                                                                    className="
                                                                                        block
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

                                                                                                {attachment.type && (
                                                                                                    <span
                                                                                                        className="
                                                                                            block
                                                                                            mt-1

                                                                                            text-[#718078]
                                                                                            text-[10px]
                                                                                        "
                                                                                                    >
                                                                                                        {
                                                                                                            attachment.type
                                                                                                        }
                                                                                                    </span>
                                                                                                )}

                                                                                            </div>

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


                                    {/* =================================================
                            ADMIN DECISION
                        ================================================= */}

                                    {selectedSolution.status ===
                                        "pending_review" && (

                                            <div
                                                className="
                                    mt-8
                                    pt-7

                                    border-t
                                    border-[#dce4de]
                                "
                                            >

                                                <div className="mb-5">

                                                    <span
                                                        className="
                                            block

                                            text-[#087542]
                                            text-[9px]
                                            font-extrabold

                                            tracking-[0.15em]
                                        "
                                                    >
                                                        ADMIN DECISION
                                                    </span>

                                                    <p
                                                        className="
                                            mt-2

                                            text-[#718078]
                                            text-[13px]
                                            leading-[1.6]
                                        "
                                                    >
                                                        Approve the latest solution to
                                                        resolve the case, or request
                                                        changes from the assigned team.
                                                    </p>

                                                </div>


                                                <textarea
                                                    value={
                                                        adminFeedback
                                                    }
                                                    onChange={(event) =>
                                                        setAdminFeedback(
                                                            event.target.value
                                                        )
                                                    }
                                                    disabled={
                                                        actionLoading
                                                    }
                                                    rows={4}
                                                    placeholder="Required when requesting changes..."
                                                    className="
                                        w-full

                                        resize-y

                                        px-4
                                        py-3

                                        rounded-[4px]

                                        border
                                        border-[#dce4de]

                                        bg-[#fbfcfb]

                                        text-[#17211b]
                                        text-[13px]
                                        leading-[1.6]

                                        outline-none

                                        focus:border-[#087542]

                                        disabled:opacity-60
                                    "
                                                />


                                                {actionError && (
                                                    <div
                                                        className="
                                            mt-4

                                            p-4

                                            rounded-[4px]

                                            border
                                            border-[#f0cccc]

                                            bg-[#fff6f6]

                                            text-[#c62828]
                                            text-[12px]
                                            font-bold
                                        "
                                                    >
                                                        {actionError}
                                                    </div>
                                                )}


                                                <div
                                                    className="
                                        flex
                                        flex-col-reverse

                                        gap-3

                                        mt-5

                                        sm:flex-row
                                        sm:justify-end
                                    "
                                                >

                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleRequestChanges
                                                        }
                                                        disabled={
                                                            actionLoading
                                                        }
                                                        className="
                                            px-6
                                            py-3.5

                                            rounded-[3px]

                                            border
                                            border-[#e5caca]

                                            bg-white

                                            text-[#c62828]
                                            text-[11px]
                                            font-extrabold

                                            cursor-pointer

                                            hover:bg-[#fff6f6]

                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                        "
                                                    >
                                                        {actionLoading
                                                            ? "Processing..."
                                                            : "Request Changes"}
                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={
                                                            handleApprove
                                                        }
                                                        disabled={
                                                            actionLoading
                                                        }
                                                        className="
                                            px-7
                                            py-3.5

                                            rounded-[3px]

                                            border-0

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
                                                        {actionLoading
                                                            ? "Processing..."
                                                            : "Approve Solution"}
                                                    </button>

                                                </div>

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


export default AdminPendingSolutions;