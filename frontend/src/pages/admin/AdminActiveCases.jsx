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

    const [activeTab, setActiveTab] =
        useState("details");

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
                setActiveTab("details");

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
        setActiveTab("details");
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

    const isEnteredValue = (value) => {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return false;
        }

        if (
            typeof value === "string" &&
            ["NOT_STATED", "not stated"].includes(
                value.trim()
            )
        ) {
            return false;
        }

        return true;
    };


    const formatDisplayValue = (value) => {
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

        if (
            typeof value === "string"
        ) {
            return value
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) =>
                    char.toUpperCase()
                );
        }

        return String(value);
    };


    const DetailField = ({ label, value }) => {
        if (!isEnteredValue(value)) {
            return null;
        }

        return (
            <InfoField
                label={label}
                value={formatDisplayValue(value)}
            />
        );
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
    TABS
================================================= */}

                        <div
                            className="
        px-8
        pt-5
        border-b
        border-[#dce4de]
    "
                        >
                            <div className="flex gap-8">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab("details")
                                    }
                                    className={`
                pb-4
                text-[11px]
                font-extrabold
                tracking-[0.08em]
                transition
                ${activeTab === "details"
                                            ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                            : "text-[#8a958e]"
                                        }
            `}
                                >
                                    REPORT DETAILS
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveTab("proposals")
                                    }
                                    className={`
                pb-4
                text-[11px]
                font-extrabold
                tracking-[0.08em]
                transition
                ${activeTab === "proposals"
                                            ? "text-[#087542] border-b-[3px] border-[#e31e24]"
                                            : "text-[#8a958e]"
                                        }
            `}
                                >
                                    TEAM PROPOSALS
                                    {proposals.length > 0 && (
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
                                            {proposals.length}
                                        </span>
                                    )}
                                </button>

                            </div>
                        </div>


                        {/* =================================================
    TAB CONTENT
================================================= */}

                        <div className="px-8 py-8">

                            {/* =================================================
        REPORT DETAILS TAB
    ================================================= */}

                            {activeTab === "details" && (
                                <div className="space-y-8">

                                    {/* REPORT INFORMATION */}

                                    <section>

                                        <h3
                                            className="
                        mb-5
                        text-[#17211b]
                        text-[18px]
                        font-extrabold
                    "
                                        >
                                            Report Information
                                        </h3>


                                        <div
                                            className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-3
                    "
                                        >

                                            <DetailField
                                                label="Report Type"
                                                value={
                                                    selectedCase.report_type
                                                }
                                            />

                                            <DetailField
                                                label="Organization"
                                                value={
                                                    selectedCase.organization
                                                }
                                            />

                                            <DetailField
                                                label="Sector"
                                                value={
                                                    selectedCase.sector
                                                }
                                            />

                                            <DetailField
                                                label="Site"
                                                value={
                                                    selectedCase.site
                                                }
                                            />

                                            <DetailField
                                                label="Incident Serial No."
                                                value={
                                                    selectedCase.incident_serial_no
                                                }
                                            />

                                            <DetailField
                                                label="Report Date"
                                                value={
                                                    selectedCase.report_date
                                                        ? formatDate(
                                                            selectedCase.report_date
                                                        )
                                                        : null
                                                }
                                            />

                                            <DetailField
                                                label="Incident Time"
                                                value={
                                                    selectedCase.incident_time
                                                }
                                            />

                                            <DetailField
                                                label="Incident Classification"
                                                value={
                                                    selectedCase.incident_classification
                                                }
                                            />

                                            <DetailField
                                                label="Report Stage"
                                                value={
                                                    selectedCase.report_stage
                                                }
                                            />

                                            <DetailField
                                                label="Incident Category"
                                                value={
                                                    selectedCase.incident_category
                                                }
                                            />

                                            <DetailField
                                                label="Incident Type"
                                                value={
                                                    selectedCase.incident_type
                                                }
                                            />

                                            <DetailField
                                                label="Incident Location"
                                                value={
                                                    selectedCase.incident_location
                                                }
                                            />

                                            <DetailField
                                                label="Activity"
                                                value={
                                                    selectedCase.activity
                                                }
                                            />

                                            <DetailField
                                                label="Location"
                                                value={
                                                    selectedCase.location
                                                }
                                            />

                                            <DetailField
                                                label="Equipment"
                                                value={
                                                    selectedCase.equipment
                                                }
                                            />

                                            <DetailField
                                                label="Facility Status"
                                                value={
                                                    selectedCase.facility_status
                                                }
                                            />

                                            <DetailField
                                                label="Language Style"
                                                value={
                                                    selectedCase.language_style
                                                }
                                            />

                                        </div>

                                    </section>


                                    {/* SAFETY INFORMATION */}

                                    <section>

                                        <h3
                                            className="
                        mb-5
                        text-[#17211b]
                        text-[18px]
                        font-extrabold
                    "
                                        >
                                            Safety Information
                                        </h3>


                                        <div
                                            className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-3
                    "
                                        >

                                            {selectedCase.fatalities?.employees > 0 && (
                                                <InfoField
                                                    label="Fatalities — Employees"
                                                    value={
                                                        selectedCase.fatalities.employees
                                                    }
                                                />
                                            )}

                                            {selectedCase.fatalities?.contractors > 0 && (
                                                <InfoField
                                                    label="Fatalities — Contractors"
                                                    value={
                                                        selectedCase.fatalities.contractors
                                                    }
                                                />
                                            )}

                                            {selectedCase.fatalities?.others > 0 && (
                                                <InfoField
                                                    label="Fatalities — Others"
                                                    value={
                                                        selectedCase.fatalities.others
                                                    }
                                                />
                                            )}


                                            {selectedCase.injuries?.employees > 0 && (
                                                <InfoField
                                                    label="Injuries — Employees"
                                                    value={
                                                        selectedCase.injuries.employees
                                                    }
                                                />
                                            )}

                                            {selectedCase.injuries?.contractors > 0 && (
                                                <InfoField
                                                    label="Injuries — Contractors"
                                                    value={
                                                        selectedCase.injuries.contractors
                                                    }
                                                />
                                            )}

                                            {selectedCase.injuries?.others > 0 && (
                                                <InfoField
                                                    label="Injuries — Others"
                                                    value={
                                                        selectedCase.injuries.others
                                                    }
                                                />
                                            )}


                                            {selectedCase.man_hours_lost?.employees > 0 && (
                                                <InfoField
                                                    label="Man Hours Lost — Employees"
                                                    value={
                                                        selectedCase.man_hours_lost.employees
                                                    }
                                                />
                                            )}

                                            {selectedCase.man_hours_lost?.contractors > 0 && (
                                                <InfoField
                                                    label="Man Hours Lost — Contractors"
                                                    value={
                                                        selectedCase.man_hours_lost.contractors
                                                    }
                                                />
                                            )}

                                            {selectedCase.man_hours_lost?.others > 0 && (
                                                <InfoField
                                                    label="Man Hours Lost — Others"
                                                    value={
                                                        selectedCase.man_hours_lost.others
                                                    }
                                                />
                                            )}


                                            <DetailField
                                                label="Direct Loss (₹ Lakhs)"
                                                value={
                                                    selectedCase.direct_loss_in_lakhs
                                                }
                                            />

                                            <DetailField
                                                label="Indirect Loss"
                                                value={
                                                    selectedCase.indirect_loss
                                                }
                                            />

                                            <DetailField
                                                label="Facility Shutdown"
                                                value={
                                                    selectedCase.facility_shutdown
                                                }
                                            />

                                            <DetailField
                                                label="Facility Outage"
                                                value={
                                                    selectedCase.facility_outage
                                                }
                                            />

                                            <DetailField
                                                label="Similar Incident Occurred"
                                                value={
                                                    selectedCase.similar_incident_occurred
                                                }
                                            />

                                            <DetailField
                                                label="Internal Investigation Completed"
                                                value={
                                                    selectedCase.internal_investigation_completed
                                                }
                                            />

                                            <DetailField
                                                label="Internal Investigation Submitted to OISD"
                                                value={
                                                    selectedCase.internal_investigation_report_submitted_to_oisd
                                                }
                                            />

                                            <DetailField
                                                label="Avoidable"
                                                value={
                                                    selectedCase.avoidable
                                                }
                                            />

                                        </div>

                                    </section>


                                    {/* CAUSES */}

                                    <section>

                                        <h3
                                            className="
                        mb-5
                        text-[#17211b]
                        text-[18px]
                        font-extrabold
                    "
                                        >
                                            Causes & Contributing Factors
                                        </h3>


                                        <div
                                            className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-3
                    "
                                        >

                                            <DetailField
                                                label="Cause of Incident"
                                                value={
                                                    selectedCase.cause_of_incident
                                                }
                                            />

                                            <DetailField
                                                label="Leakage Cause"
                                                value={
                                                    selectedCase.leakage_cause
                                                }
                                            />

                                            <DetailField
                                                label="Leakage Cause Details"
                                                value={
                                                    selectedCase.leakage_cause_details
                                                }
                                            />

                                            <DetailField
                                                label="Ignition Cause"
                                                value={
                                                    selectedCase.ignition_cause
                                                }
                                            />

                                            <DetailField
                                                label="Ignition Cause Details"
                                                value={
                                                    selectedCase.ignition_cause_details
                                                }
                                            />

                                            <DetailField
                                                label="Avoidance Factors"
                                                value={
                                                    selectedCase.avoidance_factors
                                                }
                                            />

                                            <DetailField
                                                label="Energy Source"
                                                value={
                                                    selectedCase.energy_source
                                                }
                                            />

                                        </div>

                                    </section>


                                    {/* DESCRIPTION / ACTIONS */}

                                    <section>

                                        <h3
                                            className="
                        mb-5
                        text-[#17211b]
                        text-[18px]
                        font-extrabold
                    "
                                        >
                                            Report Description
                                        </h3>


                                        {isEnteredValue(
                                            selectedCase.report_text
                                        ) && (
                                                <DetailBox>
                                                    {selectedCase.report_text}
                                                </DetailBox>
                                            )}


                                        {isEnteredValue(
                                            selectedCase.post_incident_measures
                                        ) && (
                                                <div className="mt-5">

                                                    <p
                                                        className="
                                mb-2
                                text-[#718078]
                                text-[10px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                                                    >
                                                        POST-INCIDENT MEASURES
                                                    </p>

                                                    <DetailBox>
                                                        {
                                                            selectedCase.post_incident_measures
                                                        }
                                                    </DetailBox>

                                                </div>
                                            )}


                                        {isEnteredValue(
                                            selectedCase.similar_incident_description
                                        ) && (
                                                <div className="mt-5">

                                                    <p
                                                        className="
                                mb-2
                                text-[#718078]
                                text-[10px]
                                font-extrabold
                                tracking-[0.12em]
                            "
                                                    >
                                                        SIMILAR INCIDENT
                                                    </p>

                                                    <DetailBox>
                                                        {
                                                            selectedCase.similar_incident_description
                                                        }
                                                    </DetailBox>

                                                </div>
                                            )}

                                    </section>


                                    {/* ATTACHMENTS */}

                                    {selectedCase.attachments?.length > 0 && (
                                        <section>

                                            <h3
                                                className="
                            mb-5
                            text-[#17211b]
                            text-[18px]
                            font-extrabold
                        "
                                            >
                                                Attachments
                                            </h3>


                                            <div className="space-y-3">

                                                {selectedCase.attachments.map(
                                                    (attachment, index) => (
                                                        <a
                                                            key={
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
                                        hover:border-[#b8cec0]
                                    "
                                                        >

                                                            <div className="min-w-0">

                                                                <p
                                                                    className="
                                                truncate
                                                text-[#17211b]
                                                text-[13px]
                                                font-bold
                                            "
                                                                >
                                                                    {
                                                                        attachment.name
                                                                    }
                                                                </p>

                                                                <p
                                                                    className="
                                                mt-1
                                                text-[#718078]
                                                text-[11px]
                                            "
                                                                >
                                                                    {
                                                                        attachment.type
                                                                    }
                                                                </p>

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

                                        </section>
                                    )}

                                </div>
                            )}


                            {/* =================================================
        TEAM PROPOSALS TAB
    ================================================= */}

                            {activeTab === "proposals" && (
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

                                            <h3
                                                className="
                            text-[#17211b]
                            text-[18px]
                            font-extrabold
                        "
                                            >
                                                Team Proposals
                                            </h3>

                                            <p
                                                className="
                            mt-1
                            text-[#718078]
                            text-[12px]
                        "
                                            >
                                                Review submitted team proposals
                                                before assigning this case.
                                            </p>

                                        </div>


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
                            py-16
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
                                                    This case is waiting for a
                                                    team to submit a proposal.
                                                </p>

                                            </div>
                                        )}


                                    {/* PROPOSALS */}

                                    {!proposalLoading &&
                                        !proposalError &&
                                        proposals.length > 0 && (
                                            <div className="space-y-4">

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

                                                            {/* HEADER */}

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
                                                                    label="Team Leader Email"
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


                                                            {/* PROPOSAL */}

                                                            {isEnteredValue(
                                                                proposal.solution_proposal
                                                            ) && (
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
                                                                            PROPOSAL
                                                                        </span>

                                                                        <div
                                                                            className="
                                                    p-4
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
                                                                            {
                                                                                proposal.solution_proposal
                                                                            }
                                                                        </div>

                                                                    </div>
                                                                )}


                                                            {/* ATTACHMENTS */}

                                                            {proposal.attachments?.length > 0 && (
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
                                                                        ATTACHMENTS
                                                                    </span>

                                                                    <div className="space-y-2">

                                                                        {proposal.attachments.map(
                                                                            (
                                                                                attachment,
                                                                                index
                                                                            ) => (
                                                                                <a
                                                                                    key={
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
                                                                p-3
                                                                rounded-[4px]
                                                                border
                                                                border-[#dce4de]
                                                                bg-[#f9fbfa]
                                                                text-[#087542]
                                                                text-[11px]
                                                                font-bold
                                                                hover:border-[#b8cec0]
                                                            "
                                                                                >
                                                                                    <span className="truncate">
                                                                                        {
                                                                                            attachment.name
                                                                                        }
                                                                                    </span>

                                                                                    <span>
                                                                                        Open →
                                                                                    </span>
                                                                                </a>
                                                                            )
                                                                        )}

                                                                    </div>

                                                                </div>
                                                            )}


                                                            {/* ADMIN NOTES */}

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
                                                                            event.target.value
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
                                                                        actionLoading ||
                                                                        proposal.status !==
                                                                        "pending"
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
                                                                        actionLoading ||
                                                                        proposal.status !==
                                                                        "pending"
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
                {value}
            </span>
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


export default AdminActiveCases;