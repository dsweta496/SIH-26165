const mongoose = require("mongoose");

const teamInvitationSchema = new mongoose.Schema(
    {
        invitation_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        proposal_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        team_name: {
            type: String,
            required: true,
            trim: true,
        },

        team_leader_email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        token_hash: {
            type: String,
            required: true,
            unique: true,
        },

        expires_at: {
            type: Date,
            required: true,
        },

        used: {
            type: Boolean,
            default: false,
        },

        used_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "TeamInvitation",
    teamInvitationSchema
);