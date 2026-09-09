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


    const hasEnteredValue = (value) => {
        if (value === null || value === undefined) {
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
                        String(item).trim().toUpperCase() !== "NOT_STATED" &&
                        String(item).trim().toUpperCase() !== "NOT STATED"
                )
            );
        }

        if (typeof value === "boolean") {
            return true;
        }

        if (typeof value === "number") {
            return value !== 0;
        }

        const normalizedValue = String(value).trim();

        return (
            normalizedValue !== "" &&
            normalizedValue.toUpperCase() !== "NOT_STATED" &&
            normalizedValue.toUpperCase() !== "NOT STATED"
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
                        String(item).trim().toUpperCase() !== "NOT_STATED"
                )
                .join(", ");
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        return value;
    };


    const submittedFields = selectedReport
        ? [
            ["Organisation", selectedReport.organization],
            ["Sector", selectedReport.sector],
            ["Site", selectedReport.site],
            ["Incident Serial No.", selectedReport.incident_serial_no],
            ["Report Date", formatDate(selectedReport.report_date)],
            ["Incident Time", selectedReport.incident_time],

            [
                "Incident Classification",
                selectedReport.incident_classification,
            ],

            ["Report Stage", selectedReport.report_stage],

            [
                "Incident Category",
                selectedReport.incident_category,
            ],

            ["Incident Type", selectedReport.incident_type],

            [
                "Incident Location",
                selectedReport.incident_location,
            ],

            ["Activity", selectedReport.activity],
            ["Location", selectedReport.location],
            ["Equipment", selectedReport.equipment],

            ["Facility Shutdown", selectedReport.facility_shutdown],
            ["Facility Outage", selectedReport.facility_outage],
            ["Facility Status", selectedReport.facility_status],

            [
                "Fire Duration (Hours)",
                selectedReport.fire_duration_hours,
            ],

            [
                "Fire Duration (Minutes)",
                selectedReport.fire_duration_minutes,
            ],

            [
                "Fatalities — Employees",
                selectedReport.fatalities?.employees,
            ],

            [
                "Fatalities — Contractors",
                selectedReport.fatalities?.contractors,
            ],

            [
                "Fatalities — Others",
                selectedReport.fatalities?.others,
            ],

            [
                "Injuries — Employees",
                selectedReport.injuries?.employees,
            ],

            [
                "Injuries — Contractors",
                selectedReport.injuries?.contractors,
            ],

            [
                "Injuries — Others",
                selectedReport.injuries?.others,
            ],

            [
                "Man Hours Lost — Employees",
                selectedReport.man_hours_lost?.employees,
            ],

            [
                "Man Hours Lost — Contractors",
                selectedReport.man_hours_lost?.contractors,
            ],

            [
                "Man Hours Lost — Others",
                selectedReport.man_hours_lost?.others,
            ],

            [
                "Direct Loss (₹ Lakhs)",
                selectedReport.direct_loss_in_lakhs,
            ],

            ["Indirect Loss", selectedReport.indirect_loss],

            [
                "Similar Incident Occurred",
                selectedReport.similar_incident_occurred,
            ],

            [
                "Similar Incident Description",
                selectedReport.similar_incident_description,
            ],

            [
                "Internal Investigation Completed",
                selectedReport.internal_investigation_completed,
            ],

            [
                "Internal Investigation Completion Date",
                formatDate(
                    selectedReport.internal_investigation_completion_date
                ),
            ],

            [
                "Investigation Report Submitted to OISD",
                selectedReport.internal_investigation_report_submitted_to_oisd,
            ],

            [
                "Expected OISD Submission Date",
                formatDate(
                    selectedReport.expected_oisd_submission_date
                ),
            ],

            [
                "Cause of Incident",
                selectedReport.cause_of_incident,
            ],

            [
                "Leakage Cause",
                selectedReport.leakage_cause,
            ],

            [
                "Leakage Cause Details",
                selectedReport.leakage_cause_details,
            ],

            [
                "Ignition Cause",
                selectedReport.ignition_cause,
            ],

            [
                "Ignition Cause Details",
                selectedReport.ignition_cause_details,
            ],

            ["Avoidable", selectedReport.avoidable],

            [
                "Avoidance Factors",
                selectedReport.avoidance_factors,
            ],

            [
                "Language Style",
                selectedReport.language_style,
            ],

            [
                "Energy Source",
                selectedReport.energy_source,
            ],

            [
                "Post-Incident Measures",
                selectedReport.post_incident_measures,
            ],
        ].filter(([, value]) => hasEnteredValue(value))
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
                    onClick={handleCloseReport}
                >
                    <div
                        className="
                            relative

                            w-full
                            max-w-[900px]

                            max-h-[92vh]
                            overflow-y-auto

                            rounded-[6px]

                            border
                            border-[#dce4de]

                            bg-white

                            shadow-[0_25px_80px_rgba(20,50,35,0.22)]
                        "
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div
                            className="
                                sticky
                                top-0
                                z-20

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
                            <div className="min-w-0">

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
                                    PROBLEM REPORT
                                </span>

                                <h2
                                    className="
                                        text-[#17211b]

                                        text-[28px]
                                        leading-none

                                        font-extrabold

                                        tracking-[-0.04em]

                                        break-words
                                    "
                                >
                                    {selectedReport.report_id}
                                </h2>

                                <p
                                    className="
                                        mt-2

                                        text-[#718078]
                                        text-[12px]
                                    "
                                >
                                    {selectedReport.report_type ||
                                        "Safety report"}
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={handleCloseReport}
                                disabled={submitting}
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

                            <div className="px-7 py-7">

                                {/* =================================================
                                    LOCAL TABLE RENDERER
                                ================================================= */}

                                {(() => {

                                    const renderTable = (fields) => {
                                        const visibleFields =
                                            fields.filter(
                                                ([, value]) =>
                                                    hasEnteredValue(value)
                                            );

                                        if (
                                            visibleFields.length === 0
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
                                                {visibleFields.map(
                                                    (
                                                        [label, value],
                                                        index
                                                    ) => (
                                                        <div
                                                            key={label}
                                                            className={`
                                                                grid
                                                                grid-cols-1
                                                                sm:grid-cols-[240px_1fr]

                                                                ${index <
                                                                    visibleFields.length -
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
                                                                {label}
                                                            </div>

                                                            <div
                                                                className="
                                                                    px-4
                                                                    py-3.5

                                                                    bg-white

                                                                    text-[#46534b]
                                                                    text-[13px]
                                                                    font-semibold
                                                                    leading-[1.6]

                                                                    break-words
                                                                "
                                                            >
                                                                {formatDisplayValue(
                                                                    value
                                                                )}
                                                            </div>

                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        );
                                    };


                                    const renderSection = (
                                        title,
                                        fields
                                    ) => {
                                        const visibleFields =
                                            fields.filter(
                                                ([, value]) =>
                                                    hasEnteredValue(value)
                                            );

                                        if (
                                            visibleFields.length === 0
                                        ) {
                                            return null;
                                        }

                                        return (
                                            <section className="mb-8">

                                                <div
                                                    className="
                                                        mb-3
                                                    "
                                                >
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
                                                    visibleFields
                                                )}

                                            </section>
                                        );
                                    };


                                    return (
                                        <>

                                            {/* =================================================
                                                CASE OVERVIEW
                                            ================================================= */}

                                            {renderSection(
                                                "CASE OVERVIEW",
                                                [
                                                    [
                                                        "REPORT TYPE",
                                                        selectedReport.report_type,
                                                    ],
                                                    [
                                                        "REPORT DATE",
                                                        formatDate(
                                                            selectedReport.report_date
                                                        ),
                                                    ],
                                                    [
                                                        "INCIDENT SERIAL NO.",
                                                        selectedReport.incident_serial_no,
                                                    ],
                                                    [
                                                        "REPORT STAGE",
                                                        selectedReport.report_stage,
                                                    ],
                                                    [
                                                        "SIF CLASSIFICATION",
                                                        getSifLabel(
                                                            selectedReport
                                                        ),
                                                    ],
                                                    [
                                                        "SIF SCORE",
                                                        selectedReport.sif_score,
                                                    ],
                                                ]
                                            )}


                                            {/* =================================================
                                                INCIDENT INFORMATION
                                            ================================================= */}

                                            {renderSection(
                                                "INCIDENT INFORMATION",
                                                [
                                                    [
                                                        "ORGANISATION",
                                                        selectedReport.organization,
                                                    ],
                                                    [
                                                        "SECTOR",
                                                        selectedReport.sector,
                                                    ],
                                                    [
                                                        "SITE",
                                                        selectedReport.site,
                                                    ],
                                                    [
                                                        "INCIDENT TIME",
                                                        selectedReport.incident_time,
                                                    ],
                                                    [
                                                        "INCIDENT CLASSIFICATION",
                                                        selectedReport.incident_classification,
                                                    ],
                                                    [
                                                        "INCIDENT CATEGORY",
                                                        selectedReport.incident_category,
                                                    ],
                                                    [
                                                        "INCIDENT TYPE",
                                                        selectedReport.incident_type,
                                                    ],
                                                    [
                                                        "INCIDENT LOCATION",
                                                        selectedReport.incident_location,
                                                    ],
                                                    [
                                                        "ACTIVITY",
                                                        selectedReport.activity,
                                                    ],
                                                    [
                                                        "LOCATION",
                                                        selectedReport.location,
                                                    ],
                                                    [
                                                        "EQUIPMENT",
                                                        selectedReport.equipment,
                                                    ],
                                                    [
                                                        "LANGUAGE STYLE",
                                                        selectedReport.language_style,
                                                    ],
                                                    [
                                                        "ENERGY SOURCE",
                                                        selectedReport.energy_source,
                                                    ],
                                                ]
                                            )}


                                            {/* =================================================
                                                FACILITY & OPERATIONAL IMPACT
                                            ================================================= */}

                                            {renderSection(
                                                "FACILITY & OPERATIONAL IMPACT",
                                                [
                                                    [
                                                        "FACILITY SHUTDOWN",
                                                        selectedReport.facility_shutdown,
                                                    ],
                                                    [
                                                        "FACILITY OUTAGE",
                                                        selectedReport.facility_outage,
                                                    ],
                                                    [
                                                        "FACILITY STATUS",
                                                        selectedReport.facility_status,
                                                    ],
                                                    [
                                                        "FIRE DURATION (HOURS)",
                                                        selectedReport.fire_duration_hours,
                                                    ],
                                                    [
                                                        "FIRE DURATION (MINUTES)",
                                                        selectedReport.fire_duration_minutes,
                                                    ],
                                                ]
                                            )}


                                            {/* =================================================
                                                PEOPLE & LOSS
                                            ================================================= */}

                                            {renderSection(
                                                "PEOPLE & LOSS",
                                                [
                                                    [
                                                        "FATALITIES — EMPLOYEES",
                                                        selectedReport.fatalities?.employees,
                                                    ],
                                                    [
                                                        "FATALITIES — CONTRACTORS",
                                                        selectedReport.fatalities?.contractors,
                                                    ],
                                                    [
                                                        "FATALITIES — OTHERS",
                                                        selectedReport.fatalities?.others,
                                                    ],
                                                    [
                                                        "INJURIES — EMPLOYEES",
                                                        selectedReport.injuries?.employees,
                                                    ],
                                                    [
                                                        "INJURIES — CONTRACTORS",
                                                        selectedReport.injuries?.contractors,
                                                    ],
                                                    [
                                                        "INJURIES — OTHERS",
                                                        selectedReport.injuries?.others,
                                                    ],
                                                    [
                                                        "MAN HOURS LOST — EMPLOYEES",
                                                        selectedReport.man_hours_lost?.employees,
                                                    ],
                                                    [
                                                        "MAN HOURS LOST — CONTRACTORS",
                                                        selectedReport.man_hours_lost?.contractors,
                                                    ],
                                                    [
                                                        "MAN HOURS LOST — OTHERS",
                                                        selectedReport.man_hours_lost?.others,
                                                    ],
                                                    [
                                                        "DIRECT LOSS (₹ LAKHS)",
                                                        selectedReport.direct_loss_in_lakhs,
                                                    ],
                                                    [
                                                        "INDIRECT LOSS",
                                                        selectedReport.indirect_loss,
                                                    ],
                                                ]
                                            )}


                                            {/* =================================================
                                                EVENT & CAUSAL ANALYSIS
                                            ================================================= */}

                                            {renderSection(
                                                "EVENT & CAUSAL ANALYSIS",
                                                [
                                                    [
                                                        "CAUSE OF INCIDENT",
                                                        selectedReport.cause_of_incident,
                                                    ],
                                                    [
                                                        "LEAKAGE CAUSE",
                                                        selectedReport.leakage_cause,
                                                    ],
                                                    [
                                                        "LEAKAGE CAUSE DETAILS",
                                                        selectedReport.leakage_cause_details,
                                                    ],
                                                    [
                                                        "IGNITION CAUSE",
                                                        selectedReport.ignition_cause,
                                                    ],
                                                    [
                                                        "IGNITION CAUSE DETAILS",
                                                        selectedReport.ignition_cause_details,
                                                    ],
                                                    [
                                                        "AVOIDABLE",
                                                        selectedReport.avoidable,
                                                    ],
                                                    [
                                                        "AVOIDANCE FACTORS",
                                                        selectedReport.avoidance_factors,
                                                    ],
                                                ]
                                            )}


                                            {/* =================================================
                                                INVESTIGATION & FOLLOW-UP
                                            ================================================= */}

                                            {renderSection(
                                                "INVESTIGATION & FOLLOW-UP",
                                                [
                                                    [
                                                        "SIMILAR INCIDENT OCCURRED",
                                                        selectedReport.similar_incident_occurred,
                                                    ],
                                                    [
                                                        "SIMILAR INCIDENT DESCRIPTION",
                                                        selectedReport.similar_incident_description,
                                                    ],
                                                    [
                                                        "INTERNAL INVESTIGATION COMPLETED",
                                                        selectedReport.internal_investigation_completed,
                                                    ],
                                                    [
                                                        "INTERNAL INVESTIGATION COMPLETION DATE",
                                                        selectedReport.internal_investigation_completion_date
                                                            ? formatDate(
                                                                selectedReport.internal_investigation_completion_date
                                                            )
                                                            : null,
                                                    ],
                                                    [
                                                        "INVESTIGATION REPORT SUBMITTED TO OISD",
                                                        selectedReport.internal_investigation_report_submitted_to_oisd,
                                                    ],
                                                    [
                                                        "EXPECTED OISD SUBMISSION DATE",
                                                        selectedReport.expected_oisd_submission_date
                                                            ? formatDate(
                                                                selectedReport.expected_oisd_submission_date
                                                            )
                                                            : null,
                                                    ],
                                                    [
                                                        "POST-INCIDENT MEASURES",
                                                        selectedReport.post_incident_measures,
                                                    ],
                                                ]
                                            )}


                                            {/* =================================================
                                                REPORT DESCRIPTION
                                            ================================================= */}

                                            {hasEnteredValue(
                                                selectedReport.report_text
                                            ) && (
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
                                                                selectedReport.report_text
                                                            }
                                                        </div>

                                                    </section>
                                                )}


                                            {/* =================================================
                                                ACTUAL OUTCOME
                                            ================================================= */}

                                            {hasEnteredValue(
                                                selectedReport.actual_outcome
                                            ) && (
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
                                                                selectedReport.actual_outcome
                                                            }
                                                        </div>

                                                    </section>
                                                )}


                                            {/* =================================================
                                                SUPPORTING EVIDENCE
                                            ================================================= */}

                                            {Array.isArray(
                                                selectedReport.attachments
                                            ) &&
                                                selectedReport.attachments
                                                    .length > 0 && (

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
                                                                SUPPORTING EVIDENCE
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

                                                                            px-4
                                                                            py-3.5

                                                                            border-b
                                                                            last:border-b-0
                                                                            border-[#e3e9e5]

                                                                            bg-white

                                                                            no-underline

                                                                            transition

                                                                            hover:bg-[#f7faf8]
                                                                        "
                                                                    >

                                                                        <div className="min-w-0">

                                                                            <span
                                                                                className="
                                                                                    block
                                                                                    truncate

                                                                                    text-[#17211b]
                                                                                    text-[13px]
                                                                                    font-semibold
                                                                                "
                                                                            >
                                                                                {
                                                                                    attachment.name ||
                                                                                    `Attachment ${index +
                                                                                    1
                                                                                    }`
                                                                                }
                                                                            </span>

                                                                            {attachment.size && (
                                                                                <span
                                                                                    className="
                                                                                        block
                                                                                        mt-1

                                                                                        text-[#8a958e]
                                                                                        text-[10px]
                                                                                    "
                                                                                >
                                                                                    {(
                                                                                        attachment.size /
                                                                                        (1024 *
                                                                                            1024)
                                                                                    ).toFixed(
                                                                                        2
                                                                                    )}{" "}
                                                                                    MB
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
                                                                            View →
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

                                            <section className="mb-7">

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
                                                        REVIEWER NOTES
                                                    </span>

                                                    <div
                                                        className="
                                                            mt-2
                                                            h-px
                                                            bg-[#e3e9e5]
                                                        "
                                                    />

                                                </div>

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

                                                        rounded-[4px]

                                                        border
                                                        border-[#dce5df]

                                                        bg-[#fbfcfb]

                                                        text-[#17211b]
                                                        text-[13px]
                                                        leading-[1.7]

                                                        outline-none

                                                        transition

                                                        focus:border-[#087542]
                                                        focus:bg-white

                                                        disabled:opacity-60
                                                    "
                                                />

                                            </section>


                                            {/* =================================================
                                                ACTION ERROR
                                            ================================================= */}

                                            {actionError && (
                                                <div
                                                    className="
                                                        mb-6

                                                        px-4
                                                        py-3

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


                                            {/* =================================================
                                                REVIEW ACTIONS
                                            ================================================= */}

                                            <div
                                                className="
                                                    flex
                                                    flex-col-reverse

                                                    gap-3

                                                    pt-5

                                                    border-t
                                                    border-[#e3e9e5]

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
                                                        py-3.5

                                                        rounded-[3px]

                                                        border
                                                        border-[#e5caca]

                                                        bg-white

                                                        text-[#c62828]
                                                        text-[12px]
                                                        font-extrabold

                                                        cursor-pointer

                                                        transition

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
                                                        py-3.5

                                                        rounded-[3px]

                                                        border-0

                                                        bg-[#087542]

                                                        text-white
                                                        text-[12px]
                                                        font-extrabold

                                                        cursor-pointer

                                                        transition

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

                                        </>
                                    );

                                })()}

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
    const isNotStated =
        value === null ||
        value === undefined ||
        String(value).trim().toUpperCase() === "NOT_STATED" ||
        String(value).trim().toUpperCase() === "NOT STATED";

    if (isNotStated) {
        return null;
    }

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
                {typeof value === "boolean"
                    ? value
                        ? "Yes"
                        : "No"
                    : value}
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