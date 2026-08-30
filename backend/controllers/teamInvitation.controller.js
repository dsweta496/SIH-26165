const crypto = require("crypto");

const TeamInvitation = require("../models/teamInvitation.model");

const verifyTeamInvitation = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Invitation token is required",
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const invitation = await TeamInvitation.findOne({
            token_hash: tokenHash,
        });

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: "Invalid invitation token",
            });
        }

        if (invitation.used) {
            return res.status(400).json({
                success: false,
                message: "This invitation has already been used",
            });
        }

        if (new Date() > invitation.expires_at) {
            return res.status(400).json({
                success: false,
                message: "This invitation has expired",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Invitation is valid",
            data: {
                invitation_id: invitation.invitation_id,
                proposal_id: invitation.proposal_id,
                team_name: invitation.team_name,
                team_leader_email: invitation.team_leader_email,
                expires_at: invitation.expires_at,
            },
        });
    } catch (error) {
        console.error(
            "Verify team invitation error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to verify invitation",
            error: error.message,
        });
    }
};

module.exports = {
    verifyTeamInvitation,
};