const ProblemReport = require("../models/problemReport.model");

const crypto = require("crypto");

const {
    supabase,
    supabaseBucket,
} = require("../config/supabase");

const {
    createAuditLog,
} = require("../utils/auditLogger");


const normalizeString = (value, fallback = "") => {
    if (value === undefined || value === null) {
        return fallback;
    }

    return String(value).trim();
};


const normalizeArrayField = (value) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return [];
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean);
    }

    try {
        const parsed = JSON.parse(value);

        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => String(item).trim())
                .filter(Boolean);
        }
    } catch (_) {
    }

    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};


const normalizeNumber = (value, fallback = null) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
};


const normalizeBoolean = (value, fallback = null) => {
    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return fallback;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (String(value).toLowerCase() === "true") {
        return true;
    }

    if (String(value).toLowerCase() === "false") {
        return false;
    }

    if (String(value) === "1") {
        return true;
    }

    if (String(value) === "0") {
        return false;
    }

    return fallback;
};


const normalizeCountGroup = (value) => {
    if (
        !value ||
        typeof value !== "object"
    ) {
        return {
            employees: 0,
            contractors: 0,
            others: 0,
        };
    }

    return {
        employees: normalizeNumber(
            value.employees,
            0
        ),

        contractors: normalizeNumber(
            value.contractors,
            0
        ),

        others: normalizeNumber(
            value.others,
            0
        ),
    };
};


const normalizeDate = (value) => {
    if (!value) {
        return new Date();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};


const createProblemReport = async (req, res) => {
    const uploadedFilePaths = [];

    try {
        const body = req.body || {};

        const reportId = normalizeString(
            body.report_id
        );

        const reportType = normalizeString(
            body.report_type
        );

        const sourceType = normalizeString(
            body.source_type,
            "user_report"
        );

        const sourceReference = normalizeString(
            body.source_reference,
            reportId
        );

        const activity = normalizeString(
            body.activity
        );

        const reportText = normalizeString(
            body.report_text
        );

        const languageStyle = normalizeString(
            body.language_style,
            "English"
        );


        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: "report_id is required",
            });
        }


        if (!reportType) {
            return res.status(400).json({
                success: false,
                message: "report_type is required",
            });
        }


        if (!activity) {
            return res.status(400).json({
                success: false,
                message: "activity is required",
            });
        }


        if (!reportText) {
            return res.status(400).json({
                success: false,
                message:
                    "report_text is required",
            });
        }


        const validReportTypes = [
            "UA/UC",
            "Near Miss",
            "Incident",
        ];

        if (
            !validReportTypes.includes(
                reportType
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "report_type must be UA/UC, Near Miss, or Incident",
            });
        }


        const validSourceTypes = [
            "OISD",
            "synthetic",
            "gold",
            "user_report",
        ];

        if (
            !validSourceTypes.includes(
                sourceType
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid source_type",
            });
        }


        const validLanguageStyles = [
            "English",
            "Hindi",
            "Hinglish",
            "Mixed",
        ];

        if (
            !validLanguageStyles.includes(
                languageStyle
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "language_style must be English, Hindi, Hinglish, or Mixed",
            });
        }


        const reportDate = normalizeDate(
            body.report_date
        );

        if (!reportDate) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid report_date",
            });
        }


        const existingReport =
            await ProblemReport.findOne({
                report_id: reportId,
            });

        if (existingReport) {
            return res.status(409).json({
                success: false,
                message:
                    "A problem report with this report_id already exists",
            });
        }


        const energySource =
            normalizeArrayField(
                body.energy_source
            );

        const causeOfIncident =
            normalizeArrayField(
                body.cause_of_incident
            );

        const avoidanceFactors =
            normalizeArrayField(
                body.avoidance_factors
            );


        const attachments = [];


        for (const file of req.files || []) {
            const safeName = file.originalname
                .replace(/[^a-zA-Z0-9._-]/g, "_")
                .replace(/\s+/g, "_");

            const uniqueName =
                `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

            const filePath =
                `${reportId}/${uniqueName}`;

            const MAX_UPLOAD_ATTEMPTS = 3;

            let uploadSucceeded = false;
            let lastUploadError = null;

            for (
                let attempt = 1;
                attempt <= MAX_UPLOAD_ATTEMPTS;
                attempt++
            ) {
                try {
                    const {
                        error: uploadError,
                    } = await supabase.storage
                        .from(supabaseBucket)
                        .upload(
                            filePath,
                            file.buffer,
                            {
                                contentType: file.mimetype,
                                upsert: true,
                            }
                        );

                    if (!uploadError) {
                        uploadSucceeded = true;
                        break;
                    }

                    lastUploadError = uploadError;

                    console.error(
                        `Supabase upload attempt ${attempt}/${MAX_UPLOAD_ATTEMPTS} failed:`,
                        uploadError
                    );
                } catch (uploadException) {
                    lastUploadError = uploadException;

                    console.error(
                        `Supabase upload attempt ${attempt}/${MAX_UPLOAD_ATTEMPTS} threw an exception:`,
                        uploadException
                    );
                }

                if (attempt < MAX_UPLOAD_ATTEMPTS) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, 1000 * attempt)
                    );
                }
            }

            if (!uploadSucceeded) {
                throw new Error(
                    `Failed to upload attachment after ${MAX_UPLOAD_ATTEMPTS} attempts: ${lastUploadError?.message || "Unknown upload error"}`
                );
            }

            uploadedFilePaths.push(filePath);

            const {
                data: publicUrlData,
            } = supabase.storage
                .from(supabaseBucket)
                .getPublicUrl(filePath);

            attachments.push({
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                url: publicUrlData.publicUrl,
            });
        }


        const reportData = {
            report_id:
                reportId,

            report_type:
                reportType,

            source_type:
                sourceType,

            source_reference:
                sourceReference,

            organization:
                normalizeString(
                    body.organization
                ),

            sector:
                normalizeString(
                    body.sector
                ),

            site:
                normalizeString(
                    body.site
                ),

            incident_serial_no:
                normalizeString(
                    body.incident_serial_no
                ),

            report_date:
                reportDate,

            incident_time:
                normalizeString(
                    body.incident_time
                ),

            incident_classification:
                normalizeString(
                    body.incident_classification,
                    "NOT_STATED"
                ),

            report_stage:
                normalizeString(
                    body.report_stage,
                    "NOT_STATED"
                ),

            incident_category:
                normalizeString(
                    body.incident_category,
                    "NOT_STATED"
                ),

            fire_duration_hours:
                normalizeNumber(
                    body.fire_duration_hours
                ),

            fire_duration_minutes:
                normalizeNumber(
                    body.fire_duration_minutes
                ),

            incident_type:
                normalizeString(
                    body.incident_type,
                    "NOT_STATED"
                ),

            incident_location:
                normalizeString(
                    body.incident_location,
                    "NOT_STATED"
                ),

            facility_shutdown:
                normalizeBoolean(
                    body.facility_shutdown
                ),

            facility_outage:
                normalizeBoolean(
                    body.facility_outage
                ),

            fatalities:
                normalizeCountGroup(
                    body.fatalities
                ),

            injuries:
                normalizeCountGroup(
                    body.injuries
                ),

            man_hours_lost:
                normalizeCountGroup(
                    body.man_hours_lost
                ),

            direct_loss_in_lakhs:
                normalizeNumber(
                    body.direct_loss_in_lakhs
                ),

            indirect_loss:
                normalizeString(
                    body.indirect_loss
                ),

            facility_status:
                normalizeString(
                    body.facility_status,
                    "NOT_STATED"
                ),

            activity:
                activity,

            location:
                normalizeString(
                    body.location,
                    "NOT_STATED"
                ),

            equipment:
                normalizeString(
                    body.equipment,
                    "NOT_STATED"
                ),

            report_text:
                reportText,

            post_incident_measures:
                normalizeString(
                    body.post_incident_measures
                ),

            similar_incident_occurred:
                normalizeBoolean(
                    body.similar_incident_occurred
                ),

            similar_incident_description:
                normalizeString(
                    body.similar_incident_description
                ),

            internal_investigation_completed:
                normalizeBoolean(
                    body.internal_investigation_completed
                ),

            internal_investigation_completion_date:
                body.internal_investigation_completion_date
                    ? normalizeDate(
                        body.internal_investigation_completion_date
                    )
                    : null,

            internal_investigation_report_submitted_to_oisd:
                normalizeBoolean(
                    body.internal_investigation_report_submitted_to_oisd
                ),

            expected_oisd_submission_date:
                body.expected_oisd_submission_date
                    ? normalizeDate(
                        body.expected_oisd_submission_date
                    )
                    : null,

            cause_of_incident:
                causeOfIncident,

            leakage_cause:
                normalizeString(
                    body.leakage_cause,
                    "NOT_STATED"
                ),

            leakage_cause_details:
                normalizeString(
                    body.leakage_cause_details
                ),

            ignition_cause:
                normalizeString(
                    body.ignition_cause,
                    "NOT_STATED"
                ),

            ignition_cause_details:
                normalizeString(
                    body.ignition_cause_details
                ),

            avoidable:
                normalizeBoolean(
                    body.avoidable
                ),

            avoidance_factors:
                avoidanceFactors,

            language_style:
                languageStyle,

            energy_source:
                energySource,

            attachments:
                attachments,

            review_status:
                "pending_review",

            case_status:
                "active",

            assigned_team:
                null,

            resolved_at:
                null,

            reviewer_notes:
                "",

            sif_potential:
                false,

            sif_level: null,

            sif_score:
                null,

            lsr_tags:
                [],

            evidence_phrases:
                [],

            scenario_family:
                "",

            gold_source:
                false,

            iogp_rule:
                null,
        };


        const report =
            await ProblemReport.create(
                reportData
            );


        return res.status(201).json({
            success: true,

            message:
                "Problem report submitted for review",

            data:
                report,
        });

    } catch (error) {
        console.error(
            "Create problem report error:",
            error
        );


        if (
            uploadedFilePaths.length > 0
        ) {
            try {
                await supabase.storage
                    .from(supabaseBucket)
                    .remove(
                        uploadedFilePaths
                    );
            } catch (cleanupError) {
                console.error(
                    "Attachment cleanup error:",
                    cleanupError
                );
            }
        }


        if (
            error.code === 11000
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "A problem report with this report_id already exists",
            });
        }


        if (
            error.name ===
            "ValidationError"
        ) {
            const validationErrors =
                Object.values(
                    error.errors || {}
                ).map(
                    (validationError) => ({
                        field:
                            validationError.path,

                        message:
                            validationError.message,
                    })
                );


            return res.status(400).json({
                success: false,
                message:
                    "Problem report validation failed",

                errors:
                    validationErrors,
            });
        }


        return res.status(500).json({
            success: false,
            message:
                "Failed to create problem report",

            error:
                error.message,
        });
    }
};


const getProblemReports = async (req, res) => {
    try {
        const reports =
            await ProblemReport.find()
                .sort({
                    createdAt: -1,
                })
                .lean();

        res.status(200).json({
            success: true,
            count:
                reports.length,
            data:
                reports,
        });

    } catch (error) {
        console.error(
            "Get problem reports error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch problem reports",
            error:
                error.message,
        });
    }
};


const getPendingReports = async (req, res) => {
    try {
        const reports =
            await ProblemReport.find({
                review_status:
                    "pending_review",
            })
                .sort({
                    createdAt: -1,
                })
                .lean();

        res.status(200).json({
            success: true,
            count:
                reports.length,
            data:
                reports,
        });

    } catch (error) {
        console.error(
            "Get pending reports error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch pending reports",
            error:
                error.message,
        });
    }
};


const getProblemReportById = async (req, res) => {
    try {
        const report =
            await ProblemReport.findOne({
                report_id:
                    req.params.reportId,
            }).lean();

        if (!report) {
            return res.status(404).json({
                success: false,
                message:
                    "Problem report not found",
            });
        }

        res.status(200).json({
            success: true,
            data:
                report,
        });

    } catch (error) {
        console.error(
            "Get problem report error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch problem report",
            error:
                error.message,
        });
    }
};


const reviewProblemReport = async (req, res) => {
    try {
        const { review_status, reviewer_notes } = req.body;

        if (!["approved", "rejected"].includes(review_status)) {
            return res.status(400).json({
                success: false,
                message:
                    "review_status must be approved or rejected",
            });
        }

        const report = await ProblemReport.findOne({
            report_id: req.params.reportId,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Problem report not found",
            });
        }

        if (report.review_status !== "pending_review") {
            return res.status(400).json({
                success: false,
                message:
                    "This report has already been reviewed",
            });
        }

        report.review_status = review_status;
        report.reviewer_notes = reviewer_notes || "";

        if (review_status === "approved") {
            report.case_status = "active";
        }

        if (review_status === "rejected") {
            report.case_status = "resolved";
        }

        await report.save();

        return res.status(200).json({
            success: true,
            message:
                review_status === "approved"
                    ? "Problem report approved and activated"
                    : "Problem report rejected",
            data: report,
        });
    } catch (error) {
        console.error(
            "Review problem report error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to review problem report",
            error: error.message,
        });
    }
};


const getDistressRanking = async (req, res) => {
    try {
        const reports =
            await ProblemReport.find({
                review_status:
                    "approved",

                case_status: {
                    $in: [
                        "active",
                        "assigned",
                    ],
                },
            })
                .sort({
                    sif_score: -1,
                    createdAt: -1,
                })
                .lean();

        res.status(200).json({
            success: true,
            count:
                reports.length,
            data:
                reports,
        });

    } catch (error) {
        console.error(
            "Get distress ranking error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch distress ranking",

            error:
                error.message,
        });
    }
};


const getDashboardStatistics = async (req, res) => {
    try {
        const now = new Date();

        const startOfMonth =
            new Date(
                now.getFullYear(),
                now.getMonth(),
                1
            );

        const startOfYear =
            new Date(
                now.getFullYear(),
                0,
                1
            );


        const [
            mostCommonProblems,
            mostActiveSites,
            solvedThisMonth,
            incidentsThisYear,
        ] = await Promise.all([

            ProblemReport.aggregate([
                {
                    $match: {
                        review_status:
                            "approved",
                    },
                },

                {
                    $group: {
                        _id:
                            "$activity",

                        frequency: {
                            $sum: 1,
                        },
                    },
                },

                {
                    $sort: {
                        frequency: -1,
                    },
                },

                {
                    $limit: 5,
                },

                {
                    $project: {
                        _id: 0,

                        activity:
                            "$_id",

                        frequency:
                            1,
                    },
                },
            ]),


            ProblemReport.aggregate([
                {
                    $match: {
                        review_status:
                            "approved",
                    },
                },

                {
                    $group: {
                        _id:
                            "$site",

                        frequency: {
                            $sum: 1,
                        },
                    },
                },

                {
                    $sort: {
                        frequency: -1,
                    },
                },

                {
                    $limit: 5,
                },

                {
                    $project: {
                        _id: 0,

                        site:
                            "$_id",

                        frequency:
                            1,
                    },
                },
            ]),


            ProblemReport.countDocuments({
                review_status:
                    "approved",

                case_status:
                    "resolved",

                updatedAt: {
                    $gte:
                        startOfMonth,
                },
            }),


            ProblemReport.countDocuments({
                review_status:
                    "approved",

                createdAt: {
                    $gte:
                        startOfYear,
                },
            }),
        ]);


        res.status(200).json({
            success: true,

            data: {
                most_common_problems:
                    mostCommonProblems,

                most_active_sites:
                    mostActiveSites,

                cases_solved_this_month:
                    solvedThisMonth,

                total_incidents_this_year:
                    incidentsThisYear,
            },
        });

    } catch (error) {
        console.error(
            "Get dashboard statistics error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch dashboard statistics",

            error:
                error.message,
        });
    }
};


module.exports = {
    getDashboardStatistics,
    getDistressRanking,
    createProblemReport,
    getProblemReports,
    getPendingReports,
    getProblemReportById,
    reviewProblemReport,
};