const ProblemReport = require("../models/problemReport.model");
const TeamProposal = require("../models/teamProposal.model");
const Solution = require("../models/solution.model");
const Review = require("../models/review.model");
const Team = require("../models/team.model");


const getTeamId = (req) => {
    return req.user?.team_id;
};


/* TEAM DASHBOARD */

const getTeamDashboard = async (req, res) => {
    try {
        const team_id = getTeamId(req);

        if (!team_id) {
            return res.status(403).json({
                success: false,
                message: "No team is associated with this account",
            });
        }

        const team = await Team.findOne({
            team_id,
        }).lean();

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        const currentCases = await ProblemReport.countDocuments({
            assigned_team: team_id,
            case_status: "assigned",
        });

        const resolvedCases = await ProblemReport.find({
            assigned_team: team_id,
            case_status: "resolved",
            resolved_at: {
                $ne: null,
            },
        })
            .select("report_id resolved_at")
            .lean();

        const resolvedCount = resolvedCases.length;

        const now = new Date();

        const resolvedThisMonth = resolvedCases.filter((report) => {
            const resolvedDate = new Date(report.resolved_at);

            return (
                resolvedDate.getMonth() === now.getMonth() &&
                resolvedDate.getFullYear() === now.getFullYear()
            );
        }).length;


        let totalSolveTime = 0;
        let casesWithSolveTime = 0;

        for (const report of resolvedCases) {
            const acceptedProposal =
                await TeamProposal.findOne({
                    report_id: report.report_id,
                    team_id,
                    status: "accepted",
                })
                    .select("reviewed_at")
                    .lean();

            if (
                acceptedProposal?.reviewed_at &&
                report.resolved_at
            ) {
                const difference =
                    new Date(report.resolved_at).getTime() -
                    new Date(
                        acceptedProposal.reviewed_at
                    ).getTime();

                const days =
                    difference /
                    (1000 * 60 * 60 * 24);

                if (days >= 0) {
                    totalSolveTime += days;
                    casesWithSolveTime += 1;
                }
            }
        }

        const averageSolveTime =
            casesWithSolveTime > 0
                ? Number(
                      (
                          totalSolveTime /
                          casesWithSolveTime
                      ).toFixed(1)
                  )
                : null;


        return res.status(200).json({
            success: true,
            data: {
                team: {
                    team_id: team.team_id,
                    team_name: team.team_name,
                    team_leader_email:
                        team.team_leader_email,
                },

                currentCases,

                resolvedCases: resolvedCount,

                resolvedThisMonth,

                averageSolveTime,
            },
        });
    } catch (error) {
        console.error(
            "Get team dashboard error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to load team dashboard",
            error: error.message,
        });
    }
};


/* CURRENT ASSIGNED CASES */

const getTeamCurrentCases = async (req, res) => {
    try {
        const team_id = getTeamId(req);

        if (!team_id) {
            return res.status(403).json({
                success: false,
                message: "No team is associated with this account",
            });
        }

        const reports = await ProblemReport.find({
            assigned_team: team_id,
            case_status: "assigned",
        })
            .sort({
                updatedAt: -1,
            })
            .lean();


        const cases = [];

        for (const report of reports) {
            const proposal =
                await TeamProposal.findOne({
                    report_id: report.report_id,
                    team_id,
                    status: "accepted",
                })
                    .select(
                        "proposal_id team_name solution_proposal attachments reviewed_at"
                    )
                    .lean();

            const latestSolution =
                await Solution.findOne({
                    report_id: report.report_id,
                    team_id,
                })
                    .sort({
                        review_cycle: -1,
                        createdAt: -1,
                    })
                    .lean();


            cases.push({
                ...report,

                proposal: proposal || null,

                solution_status:
                    latestSolution?.status ||
                    "solution_needed",

                latest_solution:
                    latestSolution || null,
            });
        }


        return res.status(200).json({
            success: true,
            count: cases.length,
            data: cases,
        });
    } catch (error) {
        console.error(
            "Get team current cases error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch current assigned cases",
            error: error.message,
        });
    }
};


/* RESOLVED CASES */

const getTeamResolvedCases = async (req, res) => {
    try {
        const team_id = getTeamId(req);

        if (!team_id) {
            return res.status(403).json({
                success: false,
                message: "No team is associated with this account",
            });
        }

        const reports = await ProblemReport.find({
            assigned_team: team_id,
            case_status: "resolved",
        })
            .sort({
                resolved_at: -1,
            })
            .lean();


        const cases = [];

        for (const report of reports) {
            const acceptedProposal =
                await TeamProposal.findOne({
                    report_id: report.report_id,
                    team_id,
                    status: "accepted",
                })
                    .select(
                        "proposal_id team_name solution_proposal attachments reviewed_at"
                    )
                    .lean();


            const finalSolution =
                await Solution.findOne({
                    report_id: report.report_id,
                    team_id,
                    status: "approved",
                })
                    .sort({
                        review_cycle: -1,
                        createdAt: -1,
                    })
                    .lean();


            let solveTimeDays = null;

            if (
                acceptedProposal?.reviewed_at &&
                report.resolved_at
            ) {
                const difference =
                    new Date(report.resolved_at).getTime() -
                    new Date(
                        acceptedProposal.reviewed_at
                    ).getTime();

                const days =
                    difference /
                    (1000 * 60 * 60 * 24);

                if (days >= 0) {
                    solveTimeDays = Number(
                        days.toFixed(1)
                    );
                }
            }


            const reviewCount =
                await Review.countDocuments({
                    report_id: report.report_id,
                    team_id,
                });


            cases.push({
                ...report,

                proposal:
                    acceptedProposal || null,

                final_solution:
                    finalSolution || null,

                solve_time_days:
                    solveTimeDays,

                review_cycles: reviewCount,
            });
        }


        return res.status(200).json({
            success: true,
            count: cases.length,
            data: cases,
        });
    } catch (error) {
        console.error(
            "Get team resolved cases error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch resolved cases",
            error: error.message,
        });
    }
};


/* CASE DETAILS */

const getTeamCaseDetails = async (req, res) => {
    try {
        const team_id = getTeamId(req);
        const { reportId } = req.params;

        if (!team_id) {
            return res.status(403).json({
                success: false,
                message: "No team is associated with this account",
            });
        }


        const report = await ProblemReport.findOne({
            report_id: reportId,
            assigned_team: team_id,
        }).lean();


        if (!report) {
            return res.status(404).json({
                success: false,
                message:
                    "Case not found or not assigned to your team",
            });
        }


        const proposal =
            await TeamProposal.findOne({
                report_id: reportId,
                team_id,
                status: "accepted",
            }).lean();


        const solutions =
            await Solution.find({
                report_id: reportId,
                team_id,
            })
                .sort({
                    review_cycle: 1,
                    createdAt: 1,
                })
                .lean();


        const reviews =
            await Review.find({
                report_id: reportId,
                team_id,
            })
                .sort({
                    review_cycle: 1,
                    reviewed_at: 1,
                })
                .lean();


        return res.status(200).json({
            success: true,

            data: {
                report,

                proposal:
                    proposal || null,

                solutions,

                reviews,
            },
        });
    } catch (error) {
        console.error(
            "Get team case details error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch team case details",
            error: error.message,
        });
    }
};


module.exports = {
    getTeamDashboard,
    getTeamCurrentCases,
    getTeamResolvedCases,
    getTeamCaseDetails,
};