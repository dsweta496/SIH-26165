const ProblemReport = require("../models/problemReport.model");
const TeamProposal = require("../models/teamProposal.model");
const Solution = require("../models/solution.model");


// ADMIN OVERVIEW

const getAdminOverview = async (req, res) => {
    try {
        const [
            totalReports,
            pendingReports,
            activeCases,
            assignedCases,
            resolvedCases,
            pendingProposals,
            acceptedProposals,
            pendingSolutions,
            changesRequested,
            approvedSolutions,
        ] = await Promise.all([
            ProblemReport.countDocuments(),

            ProblemReport.countDocuments({
                review_status: "pending_review",
            }),

            ProblemReport.countDocuments({
                case_status: "active",
            }),

            ProblemReport.countDocuments({
                case_status: "assigned",
            }),

            ProblemReport.countDocuments({
                case_status: "resolved",
            }),

            TeamProposal.countDocuments({
                status: "pending",
            }),

            TeamProposal.countDocuments({
                status: "accepted",
            }),

            Solution.countDocuments({
                status: "pending_review",
            }),

            Solution.countDocuments({
                status: "changes_requested",
            }),

            Solution.countDocuments({
                status: "approved",
            }),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                reports: {
                    total: totalReports,
                    pending_review: pendingReports,
                    active: activeCases,
                    assigned: assignedCases,
                    resolved: resolvedCases,
                },

                proposals: {
                    pending: pendingProposals,
                    accepted: acceptedProposals,
                },

                solutions: {
                    pending_review: pendingSolutions,
                    changes_requested: changesRequested,
                    approved: approvedSolutions,
                },
            },
        });
    } catch (error) {
        console.error(
            "Get admin overview error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin overview",
            error: error.message,
        });
    }
};


// ADMIN REVIEW QUEUE

const getAdminReviewQueue = async (req, res) => {
    try {
        const [
            pendingReports,
            pendingProposals,
            pendingSolutions,
        ] = await Promise.all([
            ProblemReport.find({
                review_status: "pending_review",
            })
                .sort({ createdAt: -1 })
                .lean(),

            TeamProposal.find({
                status: "pending",
            })
                .sort({ createdAt: -1 })
                .lean(),

            Solution.find({
                status: "pending_review",
            })
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                reports: {
                    count: pendingReports.length,
                    items: pendingReports,
                },

                proposals: {
                    count: pendingProposals.length,
                    items: pendingProposals,
                },

                solutions: {
                    count: pendingSolutions.length,
                    items: pendingSolutions,
                },
            },
        });
    } catch (error) {
        console.error(
            "Get admin review queue error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch admin review queue",
            error: error.message,
        });
    }
};


// ADMIN — ACTIVE CASES

const getActiveCases = async (req, res) => {
    try {
        const reports = await ProblemReport.find({
            review_status: "approved",
            case_status: "active",
            assigned_team: null,
        })
            .sort({
                sif_score: -1,
                createdAt: -1,
            })
            .lean();

        return res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
        });
    } catch (error) {
        console.error(
            "Get active cases error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch active cases",
            error: error.message,
        });
    }
};


// ADMIN — PENDING SOLUTIONS

const getPendingSolutions = async (req, res) => {
    try {
        const solutions = await Solution.find({
            status: "pending_review",
        })
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: solutions.length,
            data: solutions,
        });
    } catch (error) {
        console.error(
            "Get pending solutions error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch pending solutions",
            error: error.message,
        });
    }
};

// ADMIN — RESOLVED CASE HISTORY

const getResolvedCases = async (req, res) => {
    try {
        const reports = await ProblemReport.find({
            case_status: "resolved",
        })
            .sort({
                resolved_at: -1,
                createdAt: -1,
            })
            .lean();

        const reportIds = reports.map(
            (report) => report.report_id
        );

        const solutions = await Solution.find({
            report_id: {
                $in: reportIds,
            },
        })
            .sort({
                submitted_at: -1,
                createdAt: -1,
            })
            .lean();

        const solutionsByReport = {};

        for (const solution of solutions) {

            if (!solutionsByReport[solution.report_id]) {
                solutionsByReport[solution.report_id] = [];
            }

            solutionsByReport[solution.report_id].push(
                solution
            );
        }

        const data = reports.map((report) => ({
            ...report,

            solutions:
                solutionsByReport[report.report_id] || [],
        }));

        return res.status(200).json({
            success: true,
            count: data.length,
            data,
        });

    } catch (error) {

        console.error(
            "Get resolved cases error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch resolved cases",
            error: error.message,
        });
    }
};



module.exports = {
    getAdminOverview,
    getAdminReviewQueue,
    getActiveCases,
    getPendingSolutions,
    getResolvedCases
};