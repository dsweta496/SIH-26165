import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";
import api from "../../api/axios";
import AISafetyIntelligence from "../../components/AISafetyIntelligence";

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

    // AI human-review state. Kept separate from the existing
    // report approval/rejection workflow.
    const [mlResult, setMlResult] = useState(null);
    const [mlLoading, setMlLoading] = useState(false);
    const [mlReviewSubmitting, setMlReviewSubmitting] = useState(false);
    const [mlReviewError, setMlReviewError] = useState("");
    const [mlReviewMessage, setMlReviewMessage] = useState("");
    const [mlCorrectionNotes, setMlCorrectionNotes] = useState("");
    const [mlCorrections, setMlCorrections] = useState({});


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

            // Load the persisted AI result for the same report.
            // A missing ML result must not break the existing review queue.
            setMlResult(null);
            setMlReviewError("");
            setMlReviewMessage("");
            setMlCorrectionNotes("");
            setMlCorrections({});
            setMlLoading(true);

            try {
                const mlResponse = await api.get(
                    `/ml/report/${encodeURIComponent(reportId)}`
                );

                const result = mlResponse?.data?.data || null;

                setMlResult(result);
                setMlCorrectionNotes(
                    result?.correction_notes || ""
                );
                setMlCorrections(
                    result?.human_corrections || {}
                );
            } catch (mlError) {
                console.warn(
                    "ML result unavailable for report:",
                    mlError
                );
                setMlReviewError(
                    mlError?.response?.status === 404
                        ? "No AI analysis is available for this report yet."
                        : "Unable to load the AI safety analysis."
                );
            } finally {
                setMlLoading(false);
            }
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
        setMlResult(null);
        setMlReviewError("");
        setMlReviewMessage("");
        setMlCorrectionNotes("");
        setMlCorrections({});
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
       AI HUMAN REVIEW

       This is intentionally separate from the existing
       Approve / Reject report workflow.
    ========================================================= */

    const updateMlCorrection = (field, value) => {
        setMlCorrections((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const updateMlCorrectionArray = (field, value) => {
        updateMlCorrection(
            field,
            value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
        );
    };

    const handleMlReview = async (decision) => {
        if (!mlResult) {
            return;
        }

        if (
            decision === "correct" &&
            Object.keys(mlCorrections).length === 0
        ) {
            setMlReviewError(
                "Add at least one correction before submitting a corrected AI result."
            );
            return;
        }

        const confirmed = window.confirm(
            decision === "agree"
                ? "Agree with this AI result and record the human review?"
                : "Save these corrections and record the human review?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMlReviewSubmitting(true);
            setMlReviewError("");
            setMlReviewMessage("");

            const response = await api.post("/ml/review", {
                report_id: mlResult.report_id,
                model_version: mlResult.model_version,
                decision,
                corrections:
                    decision === "correct"
                        ? mlCorrections
                        : {},
                correction_notes: mlCorrectionNotes,
            });

            const updated = response?.data?.data;

            setMlResult(updated || {
                ...mlResult,
                review_status:
                    decision === "agree"
                        ? "reviewed"
                        : "corrected",
                correction_notes: mlCorrectionNotes,
                human_corrections:
                    decision === "correct"
                        ? mlCorrections
                        : mlResult.human_corrections,
            });

            setMlReviewMessage(
                decision === "agree"
                    ? "AI result accepted. Human review has been recorded."
                    : "AI result corrected. The correction has been recorded."
            );
        } catch (err) {
            console.error("ML review error:", err);

            setMlReviewError(
                err?.response?.data?.message ||
                "Unable to save the AI human review."
            );
        } finally {
            setMlReviewSubmitting(false);
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
        const level = String(report?.sif_level || "")
            .trim()
            .toUpperCase();

        if (
            level &&
            level !== "NOT_STATED" &&
            level !== "NOT STATED"
        ) {
            return report.sif_level;
        }

        if (report?.sif_potential === true) {
            return "SIF Potential";
        }

        if (report?.sif_potential === false) {
            return "Not SIF Potential";
        }

        return "Pending classification";
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

                                            md:grid-cols-[minmax(110px,1.3fr)_minmax(100px,1fr)_minmax(180px,1.6fr)_minmax(90px,0.8fr)_auto]

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
                                                AI SAFETY INTELLIGENCE
                                            ================================================= */}

                                            <section className="mb-8">
                                                <AISafetyIntelligence
                                                    report={selectedReport}
                                                    reportId={selectedReport.report_id}
                                                />
                                            </section>


                                            {/* =================================================
                                                HUMAN AI REVIEW
                                            ================================================= */}

                                            <section className="mb-8">
                                                <SectionTitle>
                                                    Human Review of AI Result
                                                </SectionTitle>

                                                {mlLoading ? (
                                                    <div className="flex items-center gap-3 rounded-[5px] border border-[#dce4de] bg-[#f8faf9] px-5 py-5">
                                                        <div className="h-5 w-5 rounded-full border-2 border-[#dce8e0] border-t-[#087542] animate-spin" />
                                                        <span className="text-[13px] font-semibold text-[#718078]">
                                                            Loading persisted AI analysis...
                                                        </span>
                                                    </div>
                                                ) : mlResult ? (
                                                    <div className="overflow-hidden rounded-[5px] border border-[#dce4de] bg-white">

                                                        <div className="grid grid-cols-1 border-b border-[#dce4de] bg-[#f7faf8] sm:grid-cols-2 lg:grid-cols-4">
                                                            <MlSummary
                                                                label="REVIEW STATUS"
                                                                value={
                                                                    mlResult.review_status === "reviewed"
                                                                        ? "Agreed"
                                                                        : mlResult.review_status === "corrected"
                                                                            ? "Corrected"
                                                                            : "Pending Review"
                                                                }
                                                            />
                                                            <MlSummary
                                                                label="SIF"
                                                                value={
                                                                    mlResult.sif_potential
                                                                        ? `${mlResult.sif_level || "Potential"} · ${Math.round((mlResult.sif_confidence || 0) * 100)}%`
                                                                        : "Not potential"
                                                                }
                                                            />
                                                            <MlSummary
                                                                label="SBRI"
                                                                value={
                                                                    mlResult.sbri_score === null || mlResult.sbri_score === undefined
                                                                        ? "—"
                                                                        : `${Math.round(mlResult.sbri_score * 100)}%`
                                                                }
                                                            />
                                                            <MlSummary
                                                                label="MODEL"
                                                                value={`${mlResult.model_name || "MuRIL"} · ${mlResult.model_version || "—"}`}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-px bg-[#e3e9e5] sm:grid-cols-2">
                                                            <MlDetail
                                                                label="Activity"
                                                                value={mlResult.activity}
                                                            />
                                                            <MlDetail
                                                                label="Location"
                                                                value={mlResult.location}
                                                            />
                                                            <MlDetail
                                                                label="Barrier failure"
                                                                value={mlResult.barrier_failure_mode}
                                                            />
                                                            <MlDetail
                                                                label="Barrier function"
                                                                value={mlResult.barrier_function}
                                                            />
                                                            <MlDetail
                                                                label="Barrier health"
                                                                value={mlResult.barrier_health}
                                                            />
                                                            <MlDetail
                                                                label="Trend"
                                                                value={mlResult.trend}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-5 border-t border-[#dce4de] p-5 lg:grid-cols-2">
                                                            <MlTagList
                                                                label="IOGP LIFE-SAVING RULES"
                                                                values={mlResult.lsr_tags}
                                                            />
                                                            <MlTagList
                                                                label="EVIDENCE PHRASES"
                                                                values={mlResult.evidence_phrases}
                                                                highlighted
                                                            />
                                                        </div>

                                                        {mlResult.review_status === "pending_review" ? (
                                                            <div className="border-t border-[#dce4de] bg-[#fbfcfb] p-5">
                                                                <div className="mb-5">
                                                                    <p className="text-[10px] font-extrabold tracking-[0.15em] text-[#087542]">
                                                                        HUMAN VALIDATION
                                                                    </p>
                                                                    <p className="mt-2 text-[13px] leading-[1.7] text-[#718078]">
                                                                        Validate the AI result without changing the original model output. Agree records acceptance; Correct records the human changes separately.
                                                                    </p>
                                                                </div>

                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                    <MlCorrectionInput
                                                                        label="SIF level"
                                                                        value={mlCorrections.sif_level || ""}
                                                                        placeholder="Low / Medium / High"
                                                                        onChange={(value) => updateMlCorrection("sif_level", value)}
                                                                    />
                                                                    <MlCorrectionInput
                                                                        label="Barrier failure mode"
                                                                        value={mlCorrections.barrier_failure_mode || ""}
                                                                        placeholder="e.g. missing"
                                                                        onChange={(value) => updateMlCorrection("barrier_failure_mode", value)}
                                                                    />
                                                                    <MlCorrectionInput
                                                                        label="Barrier function"
                                                                        value={mlCorrections.barrier_function || ""}
                                                                        placeholder="e.g. prevention"
                                                                        onChange={(value) => updateMlCorrection("barrier_function", value)}
                                                                    />
                                                                    <MlCorrectionInput
                                                                        label="Activity"
                                                                        value={mlCorrections.activity || ""}
                                                                        placeholder="Corrected activity"
                                                                        onChange={(value) => updateMlCorrection("activity", value)}
                                                                    />
                                                                    <MlCorrectionInput
                                                                        label="Location"
                                                                        value={mlCorrections.location || ""}
                                                                        placeholder="Corrected location"
                                                                        onChange={(value) => updateMlCorrection("location", value)}
                                                                    />
                                                                    <MlCorrectionInput
                                                                        label="LSR tags"
                                                                        value={Array.isArray(mlCorrections.lsr_tags) ? mlCorrections.lsr_tags.join(", ") : mlCorrections.lsr_tags || ""}
                                                                        placeholder="Comma-separated tags"
                                                                        onChange={(value) => updateMlCorrectionArray("lsr_tags", value)}
                                                                    />
                                                                </div>

                                                                <div className="mt-5">
                                                                    <label className="block text-[10px] font-extrabold tracking-[0.14em] text-[#718078]">
                                                                        AI REVIEW NOTES
                                                                    </label>
                                                                    <textarea
                                                                        value={mlCorrectionNotes}
                                                                        onChange={(event) => setMlCorrectionNotes(event.target.value)}
                                                                        rows={4}
                                                                        disabled={mlReviewSubmitting}
                                                                        placeholder="Explain why the AI result was accepted or corrected..."
                                                                        className="mt-2 w-full resize-y rounded-[5px] border border-[#dce4de] bg-white px-4 py-3 text-[13px] leading-[1.6] outline-none focus:border-[#087542]"
                                                                    />
                                                                </div>

                                                                {mlReviewError && (
                                                                    <div className="mt-4 rounded-[5px] border border-[#f0cccc] bg-[#fff6f6] px-4 py-3 text-[12px] font-bold text-[#c62828]">
                                                                        {mlReviewError}
                                                                    </div>
                                                                )}

                                                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleMlReview("correct")}
                                                                        disabled={mlReviewSubmitting}
                                                                        className="rounded-[3px] border border-[#b9c9bf] bg-white px-6 py-3 text-[11px] font-extrabold tracking-[0.08em] text-[#34423a] hover:bg-[#f1f6f3] disabled:opacity-50"
                                                                    >
                                                                        {mlReviewSubmitting ? "SAVING..." : "CORRECT AI RESULT"}
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleMlReview("agree")}
                                                                        disabled={mlReviewSubmitting}
                                                                        className="rounded-[3px] bg-[#087542] px-7 py-3 text-[11px] font-extrabold tracking-[0.08em] text-white hover:bg-[#065c38] disabled:opacity-50"
                                                                    >
                                                                        {mlReviewSubmitting ? "SAVING..." : "AGREE WITH AI"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="border-t border-[#dce4de] bg-[#f7faf8] p-5">
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <div>
                                                                        <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#087542]">
                                                                            HUMAN REVIEW RECORDED
                                                                        </p>
                                                                        <p className="mt-2 text-[13px] text-[#46534b]">
                                                                            {mlResult.review_status === "corrected"
                                                                                ? "This AI result was corrected by a human reviewer."
                                                                                : "This AI result was accepted by a human reviewer."}
                                                                        </p>
                                                                    </div>
                                                                    {mlResult.reviewed_at && (
                                                                        <span className="text-[11px] font-semibold text-[#718078]">
                                                                            {new Date(mlResult.reviewed_at).toLocaleString("en-IN")}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {mlResult.correction_notes && (
                                                                    <div className="mt-4 rounded-[4px] border border-[#dce4de] bg-white p-4">
                                                                        <p className="text-[9px] font-extrabold tracking-[0.13em] text-[#718078]">
                                                                            REVIEW NOTES
                                                                        </p>
                                                                        <p className="mt-2 text-[13px] leading-[1.6] text-[#46534b]">
                                                                            {mlResult.correction_notes}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {mlResult.human_corrections && (
                                                                    <div className="mt-4 rounded-[4px] border border-[#dce4de] bg-white p-4">
                                                                        <p className="text-[9px] font-extrabold tracking-[0.13em] text-[#718078]">
                                                                            HUMAN CORRECTIONS
                                                                        </p>
                                                                        <pre className="mt-2 overflow-x-auto text-[11px] leading-[1.6] text-[#46534b]">
                                                                            {JSON.stringify(mlResult.human_corrections, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {mlReviewMessage && (
                                                            <div className="border-t border-[#cfe4d6] bg-[#eef8f1] px-5 py-4 text-[12px] font-bold text-[#087542]">
                                                                {mlReviewMessage}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-[5px] border border-[#dce4de] bg-[#f8faf9] px-5 py-5 text-[13px] text-[#718078]">
                                                        {mlReviewError || "No AI analysis is available for this report yet."}
                                                    </div>
                                                )}
                                            </section>


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
   AI REVIEW HELPERS
============================================================= */

function MlSummary({ label, value }) {
    return (
        <div className="border-b border-[#e3e9e5] px-4 py-4 sm:border-r last:border-r-0">
            <span className="block text-[9px] font-extrabold tracking-[0.12em] text-[#718078]">
                {label}
            </span>
            <span className="mt-2 block break-words text-[12px] font-extrabold text-[#34423a]">
                {value || "—"}
            </span>
        </div>
    );
}

function MlDetail({ label, value }) {
    const normalized =
        value === null || value === undefined
            ? ""
            : Array.isArray(value)
                ? value.join(", ")
                : String(value);

    if (
        !normalized.trim() ||
        normalized.trim().toUpperCase() === "NOT_STATED"
    ) {
        return null;
    }

    return (
        <div className="bg-white px-4 py-4">
            <span className="block text-[9px] font-extrabold tracking-[0.11em] text-[#718078]">
                {label}
            </span>
            <span className="mt-2 block break-words text-[12px] font-semibold leading-[1.5] text-[#46534b]">
                {normalized}
            </span>
        </div>
    );
}

function MlTagList({ label, values, highlighted = false }) {
    const list = Array.isArray(values)
        ? values.filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== "" &&
                String(value).trim().toUpperCase() !== "NOT_STATED"
        )
        : [];

    return (
        <div>
            <span className="block text-[9px] font-extrabold tracking-[0.13em] text-[#718078]">
                {label}
            </span>

            {list.length === 0 ? (
                <p className="mt-3 text-[12px] text-[#9aa59f]">
                    None recorded.
                </p>
            ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                    {list.map((value, index) => (
                        <span
                            key={`${value}-${index}`}
                            className={
                                highlighted
                                    ? "rounded-[4px] border border-[#cfe2d5] bg-[#eef8f1] px-3 py-2 text-[11px] font-bold text-[#087542]"
                                    : "rounded-[4px] bg-[#f4f7f5] px-3 py-2 text-[11px] font-semibold text-[#46534b]"
                            }
                        >
                            {value}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function MlCorrectionInput({
    label,
    value,
    placeholder,
    onChange,
}) {
    return (
        <div>
            <label className="block text-[9px] font-extrabold tracking-[0.13em] text-[#718078]">
                {label}
            </label>
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="mt-2 w-full rounded-[4px] border border-[#dce4de] bg-white px-4 py-3 text-[12px] text-[#34423a] outline-none focus:border-[#087542]"
            />
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