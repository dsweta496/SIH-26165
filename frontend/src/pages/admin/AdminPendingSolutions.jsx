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


function AdminPendingSolutions() {

    const [solutions, setSolutions] = useState([]);

    const [selectedSolution, setSelectedSolution] =
        useState(null);

    const [solutionHistory, setSolutionHistory] =
        useState([]);

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

            try {

                setSelectedSolution(solution);

                setSolutionHistory([]);

                setHistoryLoading(true);

                setHistoryError("");

                setActionError("");

                setAdminFeedback("");

                const response =
                    await getSolutionsForProposal(
                        solution.proposal_id
                    );

                setSolutionHistory(
                    response?.data || []
                );

            } catch (err) {

                console.error(
                    "Load solution history error:",
                    err
                );

                setHistoryError(
                    err?.response?.data?.message ||
                    "Unable to load solution history."
                );

            } finally {

                setHistoryLoading(false);

            }
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
        setHistoryError("");
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

                            bg-white

                            shadow-[0_25px_80px_rgba(0,0,0,0.25)]
                        "
                    >

                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div
                            className="
                                sticky
                                top-0
                                z-10

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
                                    SOLUTION REVIEW
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
                            SUMMARY
                        ================================================= */}

                        <div
                            className="
                                px-8
                                pt-8
                            "
                        >

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
                                        selectedSolution.report_id
                                    }
                                />

                                <InfoField
                                    label="Team"
                                    value={
                                        selectedSolution.team_id
                                    }
                                />

                                <InfoField
                                    label="Proposal"
                                    value={
                                        selectedSolution.proposal_id
                                    }
                                />

                                <InfoField
                                    label="Submitted"
                                    value={
                                        formatDateTime(
                                            selectedSolution.submitted_at
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* =================================================
                            CONTENT
                        ================================================= */}

                        <div
                            className="
                                px-8
                                py-8
                            "
                        >

                            {/* HISTORY */}

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

                                    <h3
                                        className="
                                            text-[#17211b]

                                            text-[18px]
                                            font-extrabold
                                        "
                                    >
                                        Solution History
                                    </h3>

                                    <span
                                        className="
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

                                                rounded-[5px]

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
                                                p-6

                                                rounded-[5px]

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

                                        <div
                                            className="
                                                space-y-5
                                            "
                                        >

                                            {solutionHistory.map(
                                                (historyItem) => (

                                                    <div
                                                        key={
                                                            historyItem.solution_id
                                                        }
                                                        className="
                                                            p-6

                                                            rounded-[5px]

                                                            border
                                                            border-[#dce4de]

                                                            bg-white
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                flex-col

                                                                gap-3

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

                                                                        tracking-[0.14em]
                                                                    "
                                                                >
                                                                    REVIEW CYCLE
                                                                </span>

                                                                <h4
                                                                    className="
                                                                        mt-2

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
                                                                </h4>

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

                                                        <div
                                                            className="
                                                                mt-6
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
                                                                SOLUTION
                                                            </span>

                                                            <div
                                                                className="
                                                                    p-5

                                                                    rounded-[5px]

                                                                    border
                                                                    border-[#e2e9e4]

                                                                    bg-[#f9fbfa]

                                                                    text-[#4f5d55]

                                                                    text-[14px]
                                                                    leading-[1.8]

                                                                    whitespace-pre-wrap
                                                                "
                                                            >
                                                                {
                                                                    historyItem.solution_text
                                                                }
                                                            </div>

                                                        </div>


                                                        {/* ATTACHMENTS */}

                                                        {historyItem.attachments &&
                                                            historyItem
                                                                .attachments
                                                                .length >
                                                                0 && (

                                                                <div
                                                                    className="
                                                                        mt-6
                                                                    "
                                                                >

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

                                                                    <div
                                                                        className="
                                                                            space-y-2
                                                                        "
                                                                    >

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

                                                                                        p-4

                                                                                        rounded-[4px]

                                                                                        border
                                                                                        border-[#dce4de]

                                                                                        bg-white

                                                                                        no-underline

                                                                                        hover:bg-[#f5f8f6]
                                                                                    "
                                                                                >

                                                                                    <div
                                                                                        className="
                                                                                            min-w-0
                                                                                        "
                                                                                    >

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

                                                                                        <span
                                                                                            className="
                                                                                                block

                                                                                                mt-1

                                                                                                text-[#718078]

                                                                                                text-[11px]
                                                                                            "
                                                                                        >
                                                                                            {
                                                                                                attachment.type
                                                                                            }
                                                                                        </span>

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

                                                )
                                            )}

                                        </div>

                                    )}

                            </div>


                            {/* =================================================
                                ADMIN DECISION
                            ================================================= */}

                            {selectedSolution.status ===
                                "pending_review" && (

                                <div
                                    className="
                                        mt-8

                                        pt-8

                                        border-t
                                        border-[#dce4de]
                                    "
                                >

                                    <h3
                                        className="
                                            text-[#17211b]

                                            text-[18px]
                                            font-extrabold
                                        "
                                    >
                                        Admin Decision
                                    </h3>

                                    <p
                                        className="
                                            mt-2

                                            text-[#718078]

                                            text-[13px]
                                            leading-[1.6]
                                        "
                                    >
                                        Approve the solution to resolve
                                        the case, or request changes from
                                        the assigned team.
                                    </p>


                                    {/* FEEDBACK */}

                                    <div
                                        className="
                                            mt-5
                                        "
                                    >

                                        <label
                                            className="
                                                block

                                                mb-2

                                                text-[#718078]

                                                text-[10px]
                                                font-extrabold

                                                tracking-[0.12em]
                                            "
                                        >
                                            ADMIN FEEDBACK
                                        </label>

                                        <textarea
                                            value={
                                                adminFeedback
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setAdminFeedback(
                                                    event
                                                        .target
                                                        .value
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
                                            "
                                        />

                                    </div>


                                    {/* ACTION ERROR */}

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


                                    {/* BUTTONS */}

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