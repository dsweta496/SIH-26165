const Solution = require("../models/solution.model");
const TeamProposal = require("../models/teamProposal.model");
const ProblemReport = require("../models/problemReport.model");
const Team = require("../models/team.model");
const Review = require("../models/review.model");
const {
    createAuditLog,
} = require("../utils/auditLogger");

// CREATE SOLUTION

const createSolution = async (req, res) => {
    try {
        const {
            solution_id,
            proposal_id,
            report_id,
            solution_text,
            attachments,
        } = req.body;

        const team_id = req.user.team_id;

        if (
            !solution_id ||
            !proposal_id ||
            !report_id ||
            !team_id ||
            !solution_text
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "solution_id, proposal_id, report_id, team_id and solution_text are required",
            });
        }

        // Check team exists
        const team = await Team.findOne({
            team_id,
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found",
            });
        }

        // Check proposal exists
        const proposal = await TeamProposal.findOne({
            proposal_id,
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Team proposal not found",
            });
        }

        // Proposal must be accepted
        if (proposal.status !== "accepted") {
            return res.status(400).json({
                success: false,
                message:
                    "A solution can only be submitted for an accepted proposal",
            });
        }

        // Proposal must belong to this team
        if (proposal.team_id !== team_id) {
            return res.status(403).json({
                success: false,
                message:
                    "This team is not assigned to the accepted proposal",
            });
        }

        // Check report exists
        const report = await ProblemReport.findOne({
            report_id,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Problem report not found",
            });
        }

        // Ensure proposal belongs to the same report
        if (proposal.report_id !== report_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Proposal does not belong to the specified problem report",
            });
        }

        // Problem must currently be assigned
        if (report.case_status !== "assigned") {
            return res.status(400).json({
                success: false,
                message:
                    "A solution can only be submitted for an assigned problem",
            });
        }

        // Prevent duplicate active solution submissions
        const existingSolution = await Solution.findOne({
            proposal_id,
            status: {
                $in: ["pending_review", "changes_requested"],
            },
        });

        if (existingSolution) {
            return res.status(409).json({
                success: false,
                message:
                    "This proposal already has a solution awaiting review or revision",
            });
        }

        const solution = await Solution.create({
            solution_id,
            proposal_id,
            report_id,
            team_id,
            solution_text,
            attachments: attachments || [],
            status: "pending_review",
            review_cycle: 1,
            submitted_at: new Date(),
        });

        await createAuditLog({
            actor_id: req.user.userId,
            actor_role: req.user.role,
            action: "solution_submitted",
            entity_type: "Solution",
            entity_id: solution.solution_id,
            report_id: solution.report_id,
            proposal_id: solution.proposal_id,
            solution_id: solution.solution_id,
            details: "New solution submitted for review",
        });

        return res.status(201).json({
            success: true,
            message: "Solution submitted successfully",
            data: solution,
        });
    } catch (error) {
        console.error(
            "Create solution error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to submit solution",
            error: error.message,
        });
    }
};


// GET SOLUTIONS FOR A PROPOSAL

const getSolutionsForProposal = async (req, res) => {
    try {
        const { proposalId } = req.params;

        const solutions = await Solution.find({
            proposal_id: proposalId,
        }).sort({
            review_cycle: 1,
            createdAt: 1,
        });

        return res.status(200).json({
            success: true,
            count: solutions.length,
            data: solutions,
        });
    } catch (error) {
        console.error(
            "Get solutions error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch solutions",
            error: error.message,
        });
    }
};


// REQUEST CHANGES

const requestSolutionChanges = async (req, res) => {
    try {
        const { solutionId } = req.params;
        const { admin_feedback } = req.body;

        if (!admin_feedback) {
            return res.status(400).json({
                success: false,
                message: "Admin feedback is required",
            });
        }

        const solution = await Solution.findOne({
            solution_id: solutionId,
        });

        if (!solution) {
            return res.status(404).json({
                success: false,
                message: "Solution not found",
            });
        }

        if (solution.status !== "pending_review") {
            return res.status(400).json({
                success: false,
                message:
                    "Only solutions pending review can have changes requested",
            });
        }

        solution.status = "changes_requested";
        solution.admin_feedback = admin_feedback;
        solution.reviewed_at = new Date();

        await solution.save();

        await Review.create({
            review_id: `REV-${Date.now()}`,
            solution_id: solution.solution_id,
            proposal_id: solution.proposal_id,
            report_id: solution.report_id,
            team_id: solution.team_id,
            reviewer_id: req.user.userId,
            decision: "changes_requested",
            feedback: admin_feedback,
            review_cycle: solution.review_cycle,
            reviewed_at: new Date(),
        });

        await createAuditLog({
            actor_id: req.user.userId,
            actor_role: req.user.role,
            action: "solution_changes_requested",
            entity_type: "Solution",
            entity_id: solution.solution_id,
            report_id: solution.report_id,
            proposal_id: solution.proposal_id,
            solution_id: solution.solution_id,
            details: admin_feedback,
        }); s

        return res.status(200).json({
            success: true,
            message: "Changes requested from team",
            data: solution,
        });
    } catch (error) {
        console.error(
            "Request solution changes error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to request solution changes",
            error: error.message,
        });
    }
};


// APPROVE SOLUTION

const approveSolution = async (req, res) => {
    try {
        const { solutionId } = req.params;

        const solution = await Solution.findOne({
            solution_id: solutionId,
        });

        if (!solution) {
            return res.status(404).json({
                success: false,
                message: "Solution not found",
            });
        }

        if (solution.status !== "pending_review") {
            return res.status(400).json({
                success: false,
                message:
                    "Only solutions pending review can be approved",
            });
        }

        const report = await ProblemReport.findOne({
            report_id: solution.report_id,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Problem report not found",
            });
        }

        solution.status = "approved";
        solution.reviewed_at = new Date();

        await solution.save();

        await Review.create({
            review_id: `REV-${Date.now()}`,
            solution_id: solution.solution_id,
            proposal_id: solution.proposal_id,
            report_id: solution.report_id,
            team_id: solution.team_id,
            reviewer_id: req.user.userId,
            decision: "approved",
            feedback: solution.admin_feedback || "",
            review_cycle: solution.review_cycle,
            reviewed_at: new Date(),
        });

        await createAuditLog({
            actor_id: req.user.userId,
            actor_role: req.user.role,
            action: "solution_approved",
            entity_type: "Solution",
            entity_id: solution.solution_id,
            report_id: solution.report_id,
            proposal_id: solution.proposal_id,
            solution_id: solution.solution_id,
            details: "Solution approved and problem resolved",
        });

        report.case_status = "resolved";
        report.resolved_at = new Date();

        await report.save();

        return res.status(200).json({
            success: true,
            message:
                "Solution approved and problem resolved",
            data: {
                solution,
                report,
            },
        });
    } catch (error) {
        console.error(
            "Approve solution error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to approve solution",
            error: error.message,
        });
    }
};


// RESUBMIT SOLUTION

const resubmitSolution = async (req, res) => {
    try {
        const { solutionId } = req.params;

        const {
            solution_id,
            solution_text,
            attachments,
        } = req.body;

        if (!solution_id || !solution_text) {
            return res.status(400).json({
                success: false,
                message:
                    "solution_id and solution_text are required",
            });
        }

        // URL contains the PREVIOUS solution ID
        const previousSolution = await Solution.findOne({
            solution_id: solutionId,
        });

        if (previousSolution.team_id !== req.user.team_id) {
            return res.status(403).json({
                success: false,
                message:
                    "You are not authorized to resubmit this solution",
            });
        }

        if (!previousSolution) {
            return res.status(404).json({
                success: false,
                message: "Previous solution not found",
            });
        }

        // Previous submission must have requested changes
        if (previousSolution.status !== "changes_requested") {
            return res.status(400).json({
                success: false,
                message:
                    "Only solutions with requested changes can be resubmitted",
            });
        }

        // Make sure the new solution ID does not already exist
        const existingSolution = await Solution.findOne({
            solution_id,
        });

        if (existingSolution) {
            return res.status(409).json({
                success: false,
                message:
                    "A solution with this solution_id already exists",
            });
        }

        const newCycle =
            previousSolution.review_cycle + 1;

        const newSolution = await Solution.create({
            solution_id,
            proposal_id: previousSolution.proposal_id,
            report_id: previousSolution.report_id,
            team_id: previousSolution.team_id,
            solution_text,
            attachments: attachments || [],
            status: "pending_review",
            review_cycle: newCycle,
            submitted_at: new Date(),
        });

        await createAuditLog({
            actor_id: req.user.userId,
            actor_role: req.user.role,
            action: "solution_resubmitted",
            entity_type: "Solution",
            entity_id: newSolution.solution_id,
            report_id: newSolution.report_id,
            proposal_id: newSolution.proposal_id,
            solution_id: newSolution.solution_id,
            details: `Solution resubmitted for review cycle ${newSolution.review_cycle}`,
        });

        return res.status(201).json({
            success: true,
            message: "Solution resubmitted successfully",
            data: newSolution,
        });
    } catch (error) {
        console.error(
            "Resubmit solution error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to resubmit solution",
            error: error.message,
        });
    }
};

module.exports = {
    createSolution,
    getSolutionsForProposal,
    requestSolutionChanges,
    approveSolution,
    resubmitSolution,
};