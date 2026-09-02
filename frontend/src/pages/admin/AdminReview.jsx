import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

import {
    getPendingProblemReports,
    getProblemReportById,
    reviewProblemReport,
} from "../../api/problemReport.api";


function AdminReview() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    const [error, setError] = useState("");
    const [detailError, setDetailError] = useState("");
    const [actionError, setActionError] = useState("");

    const [reviewerNotes, setReviewerNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);


    /* =========================================================
       LOAD PENDING REPORTS
    ========================================================= */

    const loadReports = async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await getPendingProblemReports();

            setReports(response?.data || []);
        } catch (err) {
            console.error(
                "Load pending reports error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load pending reports."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadReports();
    }, []);


    /* =========================================================
       OPEN REPORT
    ========================================================= */

    const handleOpenReport = async (reportId) => {
        try {
            setDetailLoading(true);
            setDetailError("");
            setActionError("");

            const response =
                await getProblemReportById(reportId);

            const report = response?.data;

            console.log("REPORT ATTACHMENTS:", report?.attachments);

            setSelectedReport(report || null);

            setReviewerNotes(
                report?.reviewer_notes || ""
            );
        } catch (err) {
            console.error(
                "Load report detail error:",
                err
            );

            setDetailError(
                err?.response?.data?.message ||
                "Unable to load report details."
            );
        } finally {
            setDetailLoading(false);
        }
    };


    /* =========================================================
       CLOSE REPORT
    ========================================================= */

    const handleCloseReport = () => {
        if (submitting) {
            return;
        }

        setSelectedReport(null);
        setReviewerNotes("");
        setDetailError("");
        setActionError("");
    };


    /* =========================================================
       REVIEW REPORT
    ========================================================= */

    const handleReview = async (status) => {
        if (!selectedReport) {
            return;
        }

        const reportId =
            selectedReport.report_id;

        const action =
            status === "approved"
                ? "approve"
                : "reject";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} this report?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSubmitting(true);
            setActionError("");

            await reviewProblemReport(
                reportId,
                status,
                reviewerNotes
            );

            setSelectedReport(null);
            setReviewerNotes("");

            await loadReports();
        } catch (err) {
            console.error(
                "Review report error:",
                err
            );

            setActionError(
                err?.response?.data?.message ||
                `Unable to ${action} this report.`
            );
        } finally {
            setSubmitting(false);
        }
    };


    /* =========================================================
       DATE FORMAT
    ========================================================= */

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

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
       SIF DISPLAY
    ========================================================= */

    const getSifLabel = (report) => {
        if (report?.sif_level) {
            return report.sif_level;
        }

        if (report?.sif_potential) {
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
                    Loading review queue...
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
                    Review queue unavailable
                </h1>

                <p
                    className="
                        max-w-[420px]

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
                    onClick={loadReports}
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
                            ADMINISTRATION
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
                                    Review Queue
                                </h1>

                                <p
                                    className="
                                        max-w-[620px]

                                        mt-4

                                        text-[#718078]

                                        text-[15px]
                                        leading-[1.7]
                                    "
                                >
                                    Review problem reports
                                    submitted for administrative
                                    approval.
                                </p>

                            </div>


                            {/* QUEUE COUNT */}

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
                                    PENDING REPORTS
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
                                    {reports.length}
                                </strong>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {reports.length === 0 ? (

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
                                Review queue is clear
                            </h2>

                            <p
                                className="
                                    max-w-[460px]

                                    mx-auto
                                    mt-3

                                    text-[#718078]

                                    text-[14px]
                                    leading-[1.7]
                                "
                            >
                                There are currently no
                                problem reports waiting
                                for administrative review.
                            </p>

                        </div>

                    ) : (

                        /* =================================================
                           REPORT LIST
                        ================================================= */

                        <div className="space-y-3">

                            {reports.map(
                                (report) => (
                                    <button
                                        key={
                                            report.report_id
                                        }
                                        type="button"
                                        onClick={() =>
                                            handleOpenReport(
                                                report.report_id
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

                                        {/* REPORT */}

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
                                                REPORT
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
                                                    report.report_id
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
                                                    report.report_type
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
                                                    report.site ||
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
                                                    report.activity ||
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
                                                            report
                                                        )
                                                    }
                                                </span>

                                                {report.sif_score !==
                                                    null &&
                                                    report.sif_score !==
                                                        undefined && (
                                                        <span
                                                            className="
                                                                text-[#718078]

                                                                text-[11px]
                                                                font-bold
                                                            "
                                                        >
                                                            {
                                                                report.sif_score
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
                                                        report.createdAt
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
                REPORT DETAIL MODAL
            ================================================= */}

            {selectedReport && (
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
                                    PROBLEM REPORT
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
                                    {
                                        selectedReport.report_id
                                    }
                                </h2>

                                <p
                                    className="
                                        mt-2

                                        text-[#718078]

                                        text-[13px]
                                    "
                                >
                                    {
                                        selectedReport.report_type
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseReport
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
                            DETAIL CONTENT
                        ================================================= */}

                        {detailLoading ? (

                            <div
                                className="
                                    py-24

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
                                    Loading report...
                                </p>

                            </div>

                        ) : detailError ? (

                            <div
                                className="
                                    px-8
                                    py-16

                                    text-center
                                "
                            >

                                <p
                                    className="
                                        text-[#c62828]

                                        text-[14px]
                                        font-bold
                                    "
                                >
                                    {detailError}
                                </p>

                            </div>

                        ) : (

                            <div
                                className="
                                    px-8
                                    py-8

                                    space-y-9
                                "
                            >

                                {/* =================================================
                                    REPORT INFORMATION
                                ================================================= */}

                                <section>

                                    <SectionTitle>
                                        Report Information
                                    </SectionTitle>

                                    <div
                                        className="
                                            grid
                                            grid-cols-1

                                            gap-4

                                            sm:grid-cols-2
                                            lg:grid-cols-3
                                        "
                                    >

                                        <InfoField
                                            label="Site"
                                            value={
                                                selectedReport.site
                                            }
                                        />

                                        <InfoField
                                            label="Location"
                                            value={
                                                selectedReport.location
                                            }
                                        />

                                        <InfoField
                                            label="Activity"
                                            value={
                                                selectedReport.activity
                                            }
                                        />

                                        <InfoField
                                            label="Equipment"
                                            value={
                                                selectedReport.equipment
                                            }
                                        />

                                        <InfoField
                                            label="Report Date"
                                            value={
                                                formatDate(
                                                    selectedReport.report_date
                                                )
                                            }
                                        />

                                        <InfoField
                                            label="Language Style"
                                            value={
                                                selectedReport.language_style
                                            }
                                        />

                                    </div>

                                </section>


                                {/* =================================================
                                    REPORT DESCRIPTION
                                ================================================= */}

                                <section>

                                    <SectionTitle>
                                        Report Description
                                    </SectionTitle>

                                    <DetailBox>
                                        {
                                            selectedReport.report_text ||
                                            "No report description provided."
                                        }
                                    </DetailBox>

                                </section>


                                {/* =================================================
                                    SAFETY INFORMATION
                                ================================================= */}

                                <section>

                                    <SectionTitle>
                                        Safety Information
                                    </SectionTitle>

                                    <div
                                        className="
                                            grid
                                            grid-cols-1

                                            gap-4

                                            md:grid-cols-2
                                        "
                                    >

                                        <InfoField
                                            label="Hazard"
                                            value={
                                                selectedReport.hazard
                                            }
                                        />

                                        <InfoField
                                            label="Exposure"
                                            value={
                                                selectedReport.exposure
                                            }
                                        />

                                        <InfoField
                                            label="Unsafe Act / Condition"
                                            value={
                                                selectedReport.unsafe_act_condition
                                            }
                                        />

                                        <InfoField
                                            label="Potential Consequence"
                                            value={
                                                selectedReport.potential_consequence
                                            }
                                        />

                                        <InfoField
                                            label="Actual Outcome"
                                            value={
                                                selectedReport.actual_outcome
                                            }
                                        />

                                        <InfoField
                                            label="Immediate Action"
                                            value={
                                                selectedReport.immediate_action
                                            }
                                        />

                                    </div>

                                </section>


                                {/* =================================================
                                    BARRIER INFORMATION
                                ================================================= */}

                                <section>

                                    <SectionTitle>
                                        Barrier & Control
                                    </SectionTitle>

                                    <div
                                        className="
                                            grid
                                            grid-cols-1

                                            gap-4

                                            md:grid-cols-2
                                        "
                                    >

                                        <InfoField
                                            label="Barrier / Control"
                                            value={
                                                selectedReport.barrier_or_control
                                            }
                                        />

                                        <InfoField
                                            label="Failure Mode"
                                            value={
                                                selectedReport.barrier_failure_mode
                                            }
                                        />

                                        <InfoField
                                            label="Barrier Function"
                                            value={
                                                selectedReport.barrier_function
                                            }
                                        />

                                    </div>

                                </section>


                                {/* =================================================
                                    SIF ASSESSMENT
                                ================================================= */}

                                <section>

                                    <SectionTitle>
                                        SIF Assessment
                                    </SectionTitle>

                                    <div
                                        className="
                                            grid
                                            grid-cols-1

                                            gap-4

                                            sm:grid-cols-3
                                        "
                                    >

                                        <InfoField
                                            label="SIF Potential"
                                            value={
                                                selectedReport.sif_potential
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />

                                        <InfoField
                                            label="SIF Level"
                                            value={
                                                selectedReport.sif_level
                                            }
                                        />

                                        <InfoField
                                            label="SIF Score"
                                            value={
                                                selectedReport.sif_score ??
                                                "Not scored"
                                            }
                                        />

                                    </div>


                                    {selectedReport.lsr_tags?.length >
                                        0 && (
                                        <div className="mt-5">

                                            <span
                                                className="
                                                    block

                                                    mb-3

                                                    text-[#718078]

                                                    text-[10px]
                                                    font-extrabold

                                                    tracking-[0.14em]
                                                "
                                            >
                                                LSR TAGS
                                            </span>

                                            <div
                                                className="
                                                    flex
                                                    flex-wrap

                                                    gap-2
                                                "
                                            >
                                                {selectedReport.lsr_tags.map(
                                                    (tag) => (
                                                        <span
                                                            key={
                                                                tag
                                                            }
                                                            className="
                                                                px-3
                                                                py-2

                                                                rounded-full

                                                                bg-[#eaf4ee]

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

                                </section>


                                {/* =================================================
                                    ATTACHMENTS
                                ================================================= */}

                                {selectedReport.attachments?.length >
                                    0 && (
                                    <section>

                                        <SectionTitle>
                                            Attachments
                                        </SectionTitle>

                                        <div
                                            className="
                                                space-y-2
                                            "
                                        >

                                            {selectedReport.attachments.map(
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

                                                            p-4

                                                            rounded-[5px]

                                                            border
                                                            border-[#dce4de]

                                                            bg-[#f8faf9]

                                                            no-underline

                                                            hover:bg-[#f1f6f3]
                                                        "
                                                    >

                                                        <span
                                                            className="
                                                                truncate

                                                                text-[#4f5d55]

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


                                {/* =================================================
                                    REVIEWER NOTES
                                ================================================= */}

                                <section>

                                    <SectionTitle>
                                        Reviewer Notes
                                    </SectionTitle>

                                    <textarea
                                        value={
                                            reviewerNotes
                                        }
                                        onChange={(event) =>
                                            setReviewerNotes(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Add notes about this review..."
                                        rows={5}
                                        disabled={
                                            submitting
                                        }
                                        className="
                                            w-full

                                            resize-y

                                            px-5
                                            py-4

                                            rounded-[5px]

                                            border
                                            border-[#dce4de]

                                            bg-[#fbfcfb]

                                            text-[#17211b]

                                            text-[14px]
                                            leading-[1.6]

                                            outline-none

                                            focus:border-[#087542]
                                        "
                                    />

                                </section>


                                {/* =================================================
                                    ACTION ERROR
                                ================================================= */}

                                {actionError && (
                                    <div
                                        className="
                                            p-4

                                            rounded-[5px]

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


                                {/* =================================================
                                    REVIEW ACTIONS
                                ================================================= */}

                                <div
                                    className="
                                        flex
                                        flex-col-reverse

                                        gap-3

                                        pt-2

                                        sm:flex-row
                                        sm:justify-end
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleReview(
                                                "rejected"
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                        className="
                                            px-7
                                            py-4

                                            rounded-[3px]

                                            border
                                            border-[#e5caca]

                                            bg-white

                                            text-[#c62828]

                                            text-[12px]
                                            font-extrabold

                                            cursor-pointer

                                            hover:bg-[#fff6f6]

                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        {submitting
                                            ? "Processing..."
                                            : "Reject Report"}
                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleReview(
                                                "approved"
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                        className="
                                            px-8
                                            py-4

                                            rounded-[3px]

                                            border-0

                                            bg-[#087542]

                                            text-white

                                            text-[12px]
                                            font-extrabold

                                            cursor-pointer

                                            hover:bg-[#065c38]

                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        {submitting
                                            ? "Processing..."
                                            : "Approve Report"}
                                    </button>

                                </div>

                            </div>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}


/* =============================================================
   SECTION TITLE
============================================================= */

function SectionTitle({ children }) {
    return (
        <h3
            className="
                mb-5

                text-[#17211b]

                text-[16px]
                font-extrabold

                tracking-[-0.02em]
            "
        >
            {children}
        </h3>
    );
}


/* =============================================================
   INFORMATION FIELD
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
                border-[#e2e9e4]

                bg-[#f9fbfa]

                text-[#4f5d55]

                text-[14px]
                leading-[1.7]

                whitespace-pre-wrap
            "
        >
            {children}
        </div>
    );
}


export default AdminReview;