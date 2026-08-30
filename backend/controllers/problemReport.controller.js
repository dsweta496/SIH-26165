const ProblemReport = require("../models/problemReport.model");

const crypto = require("crypto");

const {
    supabase,
    supabaseBucket
} = require("../config/supabase");

const {
    createAuditLog,
} = require("../utils/auditLogger");

const createProblemReport = async (req, res) => {
    try {
        if (
            !req.body.report_id ||
            !req.body.report_type ||
            !req.body.report_text
        ) {
            return res.status(400).json({
                success: false,
                message: "report_id, report_type and report_text are required"
            });
        }

        const attachments = [];

        for (const file of req.files || []) {
            const safeName = file.originalname
                .replace(/[^a-zA-Z0-9._-]/g, "_")
                .replace(/\s+/g, "_");

            const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

            const filePath = `${req.body.report_id}/${uniqueName}`;

            const { error: uploadError } = await supabase.storage
                .from(supabaseBucket)
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error("Supabase upload error:", uploadError);

                return res.status(500).json({
                    success: false,
                    message: "Failed to upload attachment",
                    error: uploadError.message
                });
            }

            const { data: publicUrlData } = supabase.storage
                .from(supabaseBucket)
                .getPublicUrl(filePath);

            attachments.push({
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                url: publicUrlData.publicUrl
            });
        }

        const report = await ProblemReport.create({
            ...req.body,
            immediate_action: req.body.immediate_action || "",
            attachments
        });

        return res.status(201).json({
            success: true,
            message: "Problem report submitted for review",
            data: report
        });
    } catch (error) {
        console.error("Create problem report error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to create problem report",
            error: error.message
        });
    }
};

const getProblemReports = async (req, res) => {
    try {
        const reports = await ProblemReport.find()
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });
    } catch (error) {
        console.error("Get problem reports error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch problem reports",
            error: error.message,
        });
    }
};

const getPendingReports = async (req, res) => {
    try {
        const reports = await ProblemReport.find({
            review_status: "pending_review",
        })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });
    } catch (error) {
        console.error("Get pending reports error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch pending reports",
            error: error.message,
        });
    }
};

const getProblemReportById = async (req, res) => {
    try {
        const report = await ProblemReport.findOne({
            report_id: req.params.reportId,
        }).lean();

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Problem report not found",
            });
        }

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error("Get problem report error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch problem report",
            error: error.message,
        });
    }
};

const reviewProblemReport = async (req, res) => {
    try {
        const { review_status, reviewer_notes } = req.body;

        if (!["approved", "rejected"].includes(review_status)) {
            return res.status(400).json({
                success: false,
                message: "review_status must be approved or rejected",
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
                message: "This report has already been reviewed",
            });
        }

        report.review_status = review_status;
        report.reviewer_notes = reviewer_notes || "";

        await report.save();

        await createAuditLog({
            actor_id: req.user.userId,
            actor_role: req.user.role,
            action:
                review_status === "approved"
                    ? "report_approved"
                    : "report_rejected",
            entity_type: "ProblemReport",
            entity_id: report.report_id,
            report_id: report.report_id,
            details: reviewer_notes || "",
        });

        res.status(200).json({
            success: true,
            message:
                review_status === "approved"
                    ? "Problem report approved"
                    : "Problem report rejected",
            data: report,
        });
    } catch (error) {
        console.error("Review problem report error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to review problem report",
            error: error.message,
        });
    }
};

const getDistressRanking = async (req, res) => {
    try {
        const reports = await ProblemReport.find({
            review_status: "approved",
            case_status: {
                $in: ["active", "assigned"],
            },
        })
            .sort({ sif_score: -1, createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });
    } catch (error) {
        console.error("Get distress ranking error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch distress ranking",
            error: error.message,
        });
    }
};

const getDashboardStatistics = async (req, res) => {
    try {
        const now = new Date();

        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const startOfYear = new Date(
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
                        review_status: "approved",
                    },
                },
                {
                    $group: {
                        _id: "$activity",
                        frequency: { $sum: 1 },
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
                        activity: "$_id",
                        frequency: 1,
                    },
                },
            ]),

            ProblemReport.aggregate([
                {
                    $match: {
                        review_status: "approved",
                    },
                },
                {
                    $group: {
                        _id: "$site",
                        frequency: { $sum: 1 },
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
                        site: "$_id",
                        frequency: 1,
                    },
                },
            ]),

            ProblemReport.countDocuments({
                review_status: "approved",
                case_status: "resolved",
                updatedAt: {
                    $gte: startOfMonth,
                },
            }),

            ProblemReport.countDocuments({
                review_status: "approved",
                createdAt: {
                    $gte: startOfYear,
                },
            }),
        ]);

        res.status(200).json({
            success: true,
            data: {
                most_common_problems: mostCommonProblems,
                most_active_sites: mostActiveSites,
                cases_solved_this_month: solvedThisMonth,
                total_incidents_this_year: incidentsThisYear,
            },
        });
    } catch (error) {
        console.error("Get dashboard statistics error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message,
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