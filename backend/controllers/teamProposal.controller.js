const TeamProposal = require("../models/teamProposal.model");
const ProblemReport = require("../models/problemReport.model");

const createTeamProposal = async (req, res) => {
    try {
        const {
            proposal_id,
            report_id,
            team_id,
            team_name,
            team_leader_email,
            solution_proposal,
        } = req.body;

        const report = await ProblemReport.findOne({
            report_id,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Problem report not found",
            });
        }

        if (report.review_status !== "approved") {
            return res.status(400).json({
                success: false,
                message: "Proposal can only be submitted for an approved report",
            });
        }

        if (["resolved", "closed"].includes(report.case_status)) {
            return res.status(400).json({
                success: false,
                message: "This problem is no longer accepting proposals",
            });
        }

        const existingProposal = await TeamProposal.findOne({
            proposal_id,
        });

        if (existingProposal) {
            return res.status(409).json({
                success: false,
                message: "Proposal ID already exists",
            });
        }

        const proposal = await TeamProposal.create({
            proposal_id,
            report_id,
            team_id,
            team_name,
            team_leader_email,
            solution_proposal,
        });

        res.status(201).json({
            success: true,
            message: "Team proposal submitted successfully",
            data: proposal,
        });
    } catch (error) {
        console.error("Create team proposal error:", error.message);

        res.status(400).json({
            success: false,
            message: "Failed to create team proposal",
            error: error.message,
        });
    }
};

const getProposalsForReport = async (req, res) => {
    try {
        const proposals = await TeamProposal.find({
            report_id: req.params.reportId,
        })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: proposals.length,
            data: proposals,
        });
    } catch (error) {
        console.error("Get team proposals error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch team proposals",
            error: error.message,
        });
    }
};

const acceptTeamProposal = async (req, res) => {
    try {
        const proposal = await TeamProposal.findOne({
            proposal_id: req.params.proposalId,
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Team proposal not found",
            });
        }

        if (proposal.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This proposal has already been reviewed",
            });
        }

        const report = await ProblemReport.findOne({
            report_id: proposal.report_id,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Problem report not found",
            });
        }

        const acceptedProposal = await TeamProposal.findOne({
            report_id: proposal.report_id,
            status: "accepted",
        });

        if (acceptedProposal) {
            return res.status(409).json({
                success: false,
                message: "Another proposal has already been accepted for this problem",
            });
        }

        proposal.status = "accepted";
        proposal.reviewed_at = new Date();

        await proposal.save();

        report.case_status = "assigned";
        report.assigned_team = proposal.team_id;
        report.team_leader_email = proposal.team_leader_email;
        report.assigned_at = new Date();

        await report.save();

        await TeamProposal.updateMany(
            {
                report_id: proposal.report_id,
                proposal_id: { $ne: proposal.proposal_id },
                status: "pending",
            },
            {
                $set: {
                    status: "rejected",
                    admin_notes: "Another team proposal was accepted.",
                    reviewed_at: new Date(),
                },
            }
        );

        res.status(200).json({
            success: true,
            message: "Team proposal accepted and problem assigned",
            data: {
                proposal,
                report,
            },
        });
    } catch (error) {
        console.error("Accept team proposal error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to accept team proposal",
            error: error.message,
        });
    }
};

const rejectTeamProposal = async (req, res) => {
    try {
        const { admin_notes } = req.body;

        const proposal = await TeamProposal.findOne({
            proposal_id: req.params.proposalId,
        });

        if (!proposal) {
            return res.status(404).json({
                success: false,
                message: "Team proposal not found",
            });
        }

        if (proposal.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This proposal has already been reviewed",
            });
        }

        proposal.status = "rejected";
        proposal.admin_notes = admin_notes || "";
        proposal.reviewed_at = new Date();

        await proposal.save();

        res.status(200).json({
            success: true,
            message: "Team proposal rejected",
            data: proposal,
        });
    } catch (error) {
        console.error("Reject team proposal error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to reject team proposal",
            error: error.message,
        });
    }
};

module.exports = {
    createTeamProposal,
    getProposalsForReport,
    acceptTeamProposal,
    rejectTeamProposal,
};