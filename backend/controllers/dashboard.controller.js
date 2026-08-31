const ProblemReport = require("../models/problemReport.model");
const TeamProposal = require("../models/teamProposal.model");
const Solution = require("../models/solution.model");


// DASHBOARD OVERVIEW

const getDashboardOverview = async (req, res) => {
    try {
        const [
            totalReports,
            approvedReports,
            pendingReports,
            rejectedReports,
            activeCases,
            assignedCases,
            resolvedCases,
            totalProposals,
            pendingProposals,
            acceptedProposals,
            rejectedProposals,
            totalSolutions,
            pendingSolutions,
            changesRequested,
            approvedSolutions,
        ] = await Promise.all([
            ProblemReport.countDocuments(),

            ProblemReport.countDocuments({
                review_status: "approved",
            }),

            ProblemReport.countDocuments({
                review_status: "pending_review",
            }),

            ProblemReport.countDocuments({
                review_status: "rejected",
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

            TeamProposal.countDocuments(),

            TeamProposal.countDocuments({
                status: "pending",
            }),

            TeamProposal.countDocuments({
                status: "accepted",
            }),

            TeamProposal.countDocuments({
                status: "rejected",
            }),

            Solution.countDocuments(),

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
                    approved: approvedReports,
                    pending_review: pendingReports,
                    rejected: rejectedReports,
                },

                cases: {
                    active: activeCases,
                    assigned: assignedCases,
                    resolved: resolvedCases,
                },

                proposals: {
                    total: totalProposals,
                    pending: pendingProposals,
                    accepted: acceptedProposals,
                    rejected: rejectedProposals,
                },

                solutions: {
                    total: totalSolutions,
                    pending_review: pendingSolutions,
                    changes_requested: changesRequested,
                    approved: approvedSolutions,
                },
            },
        });
    } catch (error) {
        console.error(
            "Get dashboard overview error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard overview",
            error: error.message,
        });
    }
};


// DISTRESS RANKING

const getDashboardDistressRanking = async (req, res) => {
    try {
        const reports = await ProblemReport.find({
            review_status: "approved",
            case_status: {
                $in: ["active", "assigned"],
            },
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
            "Get dashboard distress ranking error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch dashboard distress ranking",
            error: error.message,
        });
    }
};


// DASHBOARD TRENDS

const getDashboardTrends = async (req, res) => {
    try {
        const [
            mostCommonProblems,
            mostActiveSites,
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
                        site: "$_id",
                        frequency: 1,
                    },
                },
            ]),
        ]);

        return res.status(200).json({
            success: true,
            data: {
                most_common_problems:
                    mostCommonProblems,

                most_active_sites:
                    mostActiveSites,
            },
        });
    } catch (error) {
        console.error(
            "Get dashboard trends error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard trends",
            error: error.message,
        });
    }
};


// MONTHLY / YEARLY METRICS

const getDashboardTimeMetrics = async (req, res) => {
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
            solvedThisMonth,
            incidentsThisYear,
        ] = await Promise.all([
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

        return res.status(200).json({
            success: true,
            data: {
                cases_solved_this_month:
                    solvedThisMonth,

                total_incidents_this_year:
                    incidentsThisYear,
            },
        });
    } catch (error) {
        console.error(
            "Get dashboard time metrics error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch dashboard time metrics",
            error: error.message,
        });
    }
};


module.exports = {
    getDashboardOverview,
    getDashboardDistressRanking,
    getDashboardTrends,
    getDashboardTimeMetrics,
};