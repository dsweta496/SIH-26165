import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

import api from "../../api/axios";

import {
    getProposalsForReport,
    acceptTeamProposal,
    rejectTeamProposal,
} from "../../api/teamProposal.api";


function AdminActiveCases() {

    const [cases, setCases] = useState([]);

    const [selectedCase, setSelectedCase] =
        useState(null);

    const [proposals, setProposals] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [proposalLoading, setProposalLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [proposalError, setProposalError] =
        useState("");

    const [actionError, setActionError] =
        useState("");

    const [actionLoading, setActionLoading] =
        useState(false);

    const [rejectNotes, setRejectNotes] =
        useState("");


    /* =========================================================
       LOAD ACTIVE CASES
    ========================================================= */

    const loadCases = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get(
                "/admin/active-cases"
            );

            setCases(
                response?.data?.data || []
            );

        } catch (err) {

            console.error(
                "Load active cases error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load active cases."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {
        loadCases();
    }, []);


    /* =========================================================
       OPEN CASE / LOAD TEAM PROPOSALS
    ========================================================= */

    const handleOpenCase =
        async (caseItem) => {

            try {

                setSelectedCase(caseItem);

                setProposals([]);

                setProposalLoading(true);

                setProposalError("");

                setActionError("");

                setRejectNotes("");

                const response =
                    await getProposalsForReport(
                        caseItem.report_id
                    );

                setProposals(
                    response?.data || []
                );

            } catch (err) {

                console.error(
                    "Load team proposals error:",
                    err
                );

                setProposalError(
                    err?.response?.data?.message ||
                    "Unable to load team proposals."
                );

            } finally {

                setProposalLoading(false);

            }
        };


    /* =========================================================
       CLOSE CASE
    ========================================================= */

    const handleCloseCase = () => {

        if (actionLoading) {
            return;
        }

        setSelectedCase(null);
        setProposals([]);
        setProposalError("");
        setActionError("");
        setRejectNotes("");
    };


    /* =========================================================
       ACCEPT TEAM
    ========================================================= */

    const handleAccept =
        async (proposal) => {

            const teamName =
                proposal.team_name ||
                proposal.team_id ||
                "this team";

            const confirmed =
                window.confirm(
                    `Assign ${teamName} to this case?`
                );

            if (!confirmed) {
                return;
            }

            try {

                setActionLoading(true);

                setActionError("");

                await acceptTeamProposal(
                    proposal.proposal_id
                );

                setSelectedCase(null);
                setProposals([]);

                await loadCases();

            } catch (err) {

                console.error(
                    "Accept team proposal error:",
                    err
                );

                setActionError(
                    err?.response?.data?.message ||
                    "Unable to accept this proposal."
                );

            } finally {

                setActionLoading(false);

            }
        };


    /* =========================================================
       REJECT TEAM
    ========================================================= */

    const handleReject =
        async (proposal) => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to reject this team proposal?"
                );

            if (!confirmed) {
                return;
            }

            try {

                setActionLoading(true);

                setActionError("");

                await rejectTeamProposal(
                    proposal.proposal_id,
                    rejectNotes
                );

                const response =
                    await getProposalsForReport(
                        selectedCase.report_id
                    );

                setProposals(
                    response?.data || []
                );

                setRejectNotes("");

            } catch (err) {

                console.error(
                    "Reject team proposal error:",
                    err
                );

                setActionError(
                    err?.response?.data?.message ||
                    "Unable to reject this proposal."
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


    /* =========================================================
       SIF LABEL
    ========================================================= */

    const getSifLabel = (caseItem) => {

        if (caseItem?.sif_level) {
            return caseItem.sif_level;
        }

        if (caseItem?.sif_potential) {
            return "SIF Potential";
        }

        return "Not classified";
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
                    Loading active cases...
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
                    Active cases unavailable
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
                    onClick={loadCases}
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

            {/* =================================================
                NAVBAR
            ================================================= */}

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


                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

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
                            CASE MANAGEMENT
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
                                    Active Cases
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
                                    Review active cases awaiting
                                    team assignment and evaluate
                                    submitted team proposals.
                                </p>

                            </div>


                            {/* COUNT */}

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
                                    AWAITING ASSIGNMENT
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
                                    {cases.length}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {cases.length === 0 ? (

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
                                No cases awaiting assignment
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
                                All approved active cases
                                currently have a team assigned,
                                or there are no active cases.
                            </p>

                        </div>

                    ) : (

                        /* =================================================
                           CASE LIST
                        ================================================= */

                        <div className="space-y-3">

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

                                            md:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto]

                                            md:items-center
                                        "
                                    >

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
                                                    caseItem.report_id
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
                                                {
                                                    caseItem.report_type ||
                                                    "Problem Report"
                                                }
                                            </span>

                                        </div>


                                        {/* SITE */}

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
                                                SITE
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-2

                                                    truncate

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                    font-semibold
                                                "
                                            >
                                                {
                                                    caseItem.site ||
                                                    "Not stated"
                                                }
                                            </span>

                                        </div>


                                        {/* ACTIVITY */}

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
                                                ACTIVITY
                                            </span>

                                            <span
                                                className="
                                                    block

                                                    mt-2

                                                    truncate

                                                    text-[#4f5d55]

                                                    text-[13px]
                                                    font-semibold
                                                "
                                            >
                                                {
                                                    caseItem.activity ||
                                                    "Not stated"
                                                }
                                            </span>

                                        </div>


                                        {/* SIF */}

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
                                                SIF
                                            </span>

                                            <div
                                                className="
                                                    flex
                                                    items-center

                                                    gap-2

                                                    mt-2
                                                "
                                            >

                                                <span
                                                    className="
                                                        text-[#087542]

                                                        text-[12px]
                                                        font-extrabold
                                                    "
                                                >
                                                    {
                                                        getSifLabel(
                                                            caseItem
                                                        )
                                                    }
                                                </span>

                                                {caseItem.sif_score !==
                                                    null &&
                                                    caseItem.sif_score !==
                                                    undefined && (

                                                        <span
                                                            className="
                                                                text-[#718078]

                                                                text-[11px]
                                                                font-bold
                                                            "
                                                        >
                                                            {
                                                                caseItem.sif_score
                                                            }
                                                        </span>

                                                    )}

                                            </div>

                                        </div>


                                        {/* DATE + ACTION */}

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
                                                    text-[#718078]

                                                    text-[11px]
                                                    font-medium

                                                    whitespace-nowrap
                                                "
                                            >
                                                {
                                                    formatDate(
                                                        caseItem.createdAt
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
                                                Proposals →
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
                TEAM PROPOSALS MODAL
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
                            max-w-[1050px]

                            max-h-[92vh]

                            overflow-y-auto

                            rounded-[6px]

                            bg-white

                            shadow-[0_25px_80px_rgba(0,0,0,0.25)]
                        "
                    >

                        {/* =================================================
                            MODAL HEADER
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
                                    TEAM ASSIGNMENT
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
                                    Team Proposals
                                </h2>

                                <p
                                    className="
                                        mt-2

                                        text-[#718078]

                                        text-[13px]
                                    "
                                >
                                    {
                                        selectedCase.report_id
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseCase
                                }
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
                            CASE SUMMARY
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

                                    sm:grid-cols-3
                                "
                            >

                                <InfoField
                                    label="Site"
                                    value={
                                        selectedCase.site
                                    }
                                />

                                <InfoField
                                    label="Activity"
                                    value={
                                        selectedCase.activity
                                    }
                                />

                                <InfoField
                                    label="SIF Score"
                                    value={
                                        selectedCase.sif_score ??
                                        "Not scored"
                                    }
                                />

                            </div>

                        </div>


                        {/* =================================================
                            PROPOSALS
                        ================================================= */}

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
                                    Submitted Proposals
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
                                    {proposals.length}
                                </span>

                            </div>


                            {/* LOADING */}

                            {proposalLoading && (

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
                                            mt-5

                                            text-[#718078]

                                            text-[14px]
                                        "
                                    >
                                        Loading team proposals...
                                    </p>

                                </div>

                            )}


                            {/* ERROR */}

                            {!proposalLoading &&
                                proposalError && (

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
                                        {proposalError}
                                    </div>

                                )}


                            {/* NO PROPOSALS */}

                            {!proposalLoading &&
                                !proposalError &&
                                proposals.length === 0 && (

                                    <div
                                        className="
                                            px-6
                                            py-14

                                            rounded-[5px]

                                            border
                                            border-[#dce4de]

                                            bg-[#f9fbfa]

                                            text-center
                                        "
                                    >

                                        <h4
                                            className="
                                                text-[#17211b]

                                                text-[18px]
                                                font-extrabold
                                            "
                                        >
                                            No team proposals yet
                                        </h4>

                                        <p
                                            className="
                                                max-w-[430px]

                                                mx-auto
                                                mt-2

                                                text-[#718078]

                                                text-[13px]
                                                leading-[1.7]
                                            "
                                        >
                                            This case is waiting
                                            for a team to submit
                                            a proposal.
                                        </p>

                                    </div>

                                )}


                            {/* PROPOSALS */}

                            {!proposalLoading &&
                                !proposalError &&
                                proposals.length > 0 && (

                                    <div
                                        className="
                                            space-y-4
                                        "
                                    >

                                        {proposals.map(
                                            (proposal) => (

                                                <div
                                                    key={
                                                        proposal.proposal_id
                                                    }
                                                    className="
                                                        p-6

                                                        rounded-[5px]

                                                        border
                                                        border-[#dce4de]

                                                        bg-white

                                                        shadow-[0_5px_20px_rgba(20,50,35,0.035)]
                                                    "
                                                >

                                                    {/* PROPOSAL HEADER */}

                                                    <div
                                                        className="
                                                            flex
                                                            flex-col

                                                            gap-4

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
                                                                TEAM
                                                            </span>

                                                            <h4
                                                                className="
                                                                    mt-2

                                                                    text-[#17211b]

                                                                    text-[19px]
                                                                    font-extrabold
                                                                "
                                                            >
                                                                {
                                                                    proposal.team_name ||
                                                                    proposal.team_id ||
                                                                    "Unnamed Team"
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
                                                                proposal.status ||
                                                                "pending"
                                                            }
                                                        </span>

                                                    </div>


                                                    {/* TEAM DETAILS */}

                                                    <div
                                                        className="
                                                            grid
                                                            grid-cols-1

                                                            gap-4

                                                            mt-6

                                                            sm:grid-cols-2
                                                        "
                                                    >

                                                        <InfoField
                                                            label="Team ID"
                                                            value={
                                                                proposal.team_id
                                                            }
                                                        />


                                                        <InfoField
                                                            label="Team Leader"
                                                            value={
                                                                proposal.team_leader_email
                                                            }
                                                        />
                                                        <InfoField
                                                            label="Submitted"
                                                            value={
                                                                formatDate(
                                                                    proposal.createdAt
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    {/* SOLUTION PROPOSAL */}

                                                    {proposal.solution_proposal && (

                                                        <div
                                                            className="
                                                                mt-5
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
                                                                SOLUTION PROPOSAL
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
                                                                    leading-[1.7]

                                                                    whitespace-pre-wrap
                                                                "
                                                            >
                                                                {proposal.solution_proposal}
                                                            </div>

                                                        </div>

                                                    )}

                                                    {proposal.attachments &&
                                                        proposal.attachments.length > 0 && (
                                                            <div className="mt-5">
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
                                                                    SUPPORTING DOCUMENTS
                                                                </span>

                                                                <div
                                                                    className="
                    space-y-2

                    p-4
                    rounded-[5px]

                    border
                    border-[#e2e9e4]

                    bg-[#f9fbfa]
                "
                                                                >
                                                                    {proposal.attachments.map(
                                                                        (attachment, index) => (
                                                                            <div
                                                                                key={`${attachment.url}-${index}`}
                                                                                className="
                                flex
                                items-center
                                justify-between
                                gap-4

                                px-4
                                py-3

                                rounded-[4px]

                                border
                                border-[#e2e9e4]

                                bg-white
                            "
                                                                            >
                                                                                <div
                                                                                    className="
                                    min-w-0
                                    flex
                                    items-center
                                    gap-3
                                "
                                                                                >
                                                                                    <span
                                                                                        className="
                                        shrink-0
                                        text-[#087542]
                                        text-[16px]
                                    "
                                                                                    >
                                                                                        📄
                                                                                    </span>

                                                                                    <span
                                                                                        className="
                                        truncate

                                        text-[#33423a]
                                        text-[13px]
                                        font-semibold
                                    "
                                                                                    >
                                                                                        {attachment.name ||
                                                                                            `Attachment ${index + 1}`}
                                                                                    </span>
                                                                                </div>

                                                                                <a
                                                                                    href={attachment.url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="
                                    shrink-0

                                    text-[#087542]
                                    text-[11px]
                                    font-extrabold

                                    hover:underline
                                "
                                                                                >
                                                                                    View →
                                                                                </a>
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}


                                                    {/* REJECTION NOTES */}

                                                    <div
                                                        className="
                                                            mt-5
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
                                                            ADMIN NOTES
                                                        </span>

                                                        <textarea
                                                            value={
                                                                rejectNotes
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                setRejectNotes(
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            rows={3}
                                                            disabled={
                                                                actionLoading
                                                            }
                                                            placeholder="Optional note when rejecting..."
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


                                                    {/* ACTIONS */}

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
                                                            onClick={() =>
                                                                handleReject(
                                                                    proposal
                                                                )
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
                                                                : "Reject"}
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleAccept(
                                                                    proposal
                                                                )
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
                                                                : "Accept Team"}
                                                        </button>

                                                    </div>

                                                </div>

                                            )
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


export default AdminActiveCases;