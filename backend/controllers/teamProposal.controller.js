const TeamProposal = require("../models/teamProposal.model");
const ProblemReport = require("../models/problemReport.model");
const Team = require("../models/team.model");
const crypto = require("crypto");
const {
    supabase,
    supabaseBucket,
} = require("../config/supabase");
const {
    createAuditLog,
} = require("../utils/auditLogger");

const TeamInvitation = require("../models/teamInvitation.model");

const { sendEmail } = require("../services/email.service");

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

        if (
            !proposal_id ||
            !report_id ||
            !team_name ||
            !team_leader_email ||
            !solution_proposal
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "proposal_id, report_id, team_name, team_leader_email and solution_proposal are required",
            });
        }

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
                message:
                    "Proposal can only be submitted for an approved report",
            });
        }

        if (report.case_status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Team proposals can only be submitted for active cases",
            });
        }

        if (report.assigned_team) {
            return res.status(400).json({
                success: false,
                message: "This problem is already assigned to a team",
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

        let proposalTeamId = null;

        if (team_id) {
            const team = await Team.findOne({
                team_id,
            });

            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: "Registered team not found",
                });
            }

            const submittedEmail = team_leader_email.toLowerCase();
            const registeredEmail = team.team_leader_email.toLowerCase();

            const nameMatches = team.team_name === team_name;
            const emailMatches = registeredEmail === submittedEmail;

            if (!nameMatches || !emailMatches) {
                const errors = {};

                if (!nameMatches) {
                    errors.team_name =
                        "Team name does not match the registered team";
                }

                if (!emailMatches) {
                    errors.team_leader_email =
                        "Team leader email does not match the registered team";
                }

                return res.status(400).json({
                    success: false,
                    message: "Team details do not match the registered team",
                    errors,
                });
            }

            proposalTeamId = team.team_id;
        }

        const attachments = [];

        for (const file of req.files || []) {
            const safeName = file.originalname
                .replace(/[^a-zA-Z0-9._-]/g, "_")
                .replace(/\s+/g, "_");

            const uniqueName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;

            const filePath = `team-proposals/${proposal_id}/${uniqueName}`;

            const { error: uploadError } =
                await supabase.storage
                    .from(supabaseBucket)
                    .upload(filePath, file.buffer, {
                        contentType: file.mimetype,
                        upsert: false,
                    });

            if (uploadError) {
                console.error(
                    "Supabase proposal upload error:",
                    uploadError
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to upload proposal attachment",
                    error: uploadError.message,
                });
            }

            const { data: publicUrlData } =
                supabase.storage
                    .from(supabaseBucket)
                    .getPublicUrl(filePath);

            attachments.push({
                name: file.originalname,
                type: file.mimetype,
                size: file.size,
                url: publicUrlData.publicUrl,
            });
        }

        const proposal = await TeamProposal.create({
            proposal_id,
            report_id,
            team_id: proposalTeamId,
            team_name,
            team_leader_email,
            solution_proposal,
            attachments,
        });

        return res.status(201).json({
            success: true,
            message: "Team proposal submitted successfully",
            data: proposal,
        });
    } catch (error) {
        console.error(
            "Create team proposal error:",
            error.message
        );

        return res.status(400).json({
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
                message:
                    "Another proposal has already been accepted for this problem",
            });
        }

        proposal.status = "accepted";
        proposal.reviewed_at = new Date();

        await proposal.save();

        report.case_status = "assigned";
        report.assigned_team = proposal.team_id || null;

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

        let invitationSent = false;

        if (!proposal.team_id) {
            const existingInvitation = await TeamInvitation.findOne({
                proposal_id: proposal.proposal_id,
            });

            if (!existingInvitation) {
                const rawToken = crypto.randomBytes(32).toString("hex");

                const tokenHash = crypto
                    .createHash("sha256")
                    .update(rawToken)
                    .digest("hex");

                const invitationId = `INV-${crypto
                    .randomBytes(6)
                    .toString("hex")
                    .toUpperCase()}`;

                const expiresAt = new Date(
                    Date.now() + 24 * 60 * 60 * 1000
                );

                await TeamInvitation.create({
                    invitation_id: invitationId,
                    proposal_id: proposal.proposal_id,
                    team_name: proposal.team_name,
                    team_leader_email: proposal.team_leader_email,
                    token_hash: tokenHash,
                    expires_at: expiresAt,
                });

                const signupUrl =
                    `${process.env.FRONTEND_URL}/team/signup?token=${rawToken}`;

                await sendEmail({
                    to: proposal.team_leader_email,
                    subject:
                        "Your OIL SIF team proposal has been accepted",
                    text: `
Your team proposal has been accepted.

Team: ${proposal.team_name}
Problem Report: ${proposal.report_id}

Your team can now create an account and continue with the accepted proposal.

Sign up here:
${signupUrl}

This invitation link expires in 24 hours.

If you do not want to continue, you can simply ignore this email.
                    `.trim(),
                    html: `
                        <h2>Your team proposal has been accepted</h2>

                        <p>
                            Your team proposal has been accepted by the administrator.
                        </p>

                        <p>
                            <strong>Team:</strong> ${proposal.team_name}<br>
                            <strong>Problem Report:</strong> ${proposal.report_id}
                        </p>

                        <p>
                            Your team can now create an account and continue
                            with the accepted proposal.
                        </p>

                        <p>
                            <a href="${signupUrl}">
                                Create your team account
                            </a>
                        </p>

                        <p>
                            This invitation link expires in 24 hours.
                        </p>

                        <p>
                            If you do not want to continue,
                            you can simply ignore this email.
                        </p>
                    `,
                });

                invitationSent = true;
            }
        }

        await createAuditLog({
            actor_id: req.user.userId,
            actor_role: req.user.role,
            action: "proposal_accepted",
            entity_type: "TeamProposal",
            entity_id: proposal.proposal_id,
            report_id: proposal.report_id,
            proposal_id: proposal.proposal_id,
            details: proposal.team_id
                ? `Proposal accepted for team ${proposal.team_id}`
                : "Guest team proposal accepted and invitation issued",
        });

        return res.status(200).json({
            success: true,
            message: "Team proposal accepted and problem assigned",
            data: {
                proposal,
                report,
                invitation_sent: invitationSent,
            },
        });
    } catch (error) {
        console.error(
            "Accept team proposal error:",
            error.message
        );

        return res.status(500).json({
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

        await createAuditLog({
            actor_id: req.user.userId,
            actor_role: req.user.role,
            action: "proposal_rejected",
            entity_type: "TeamProposal",
            entity_id: proposal.proposal_id,
            report_id: proposal.report_id,
            proposal_id: proposal.proposal_id,
            details: admin_notes || "",
        });

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