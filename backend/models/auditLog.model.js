const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        audit_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        actor_id: {
            type: String,
            required: true,
            trim: true,
        },

        actor_role: {
            type: String,
            enum: ["admin", "team"],
            required: true,
        },

        action: {
            type: String,
            required: true,
            trim: true,
        },

        entity_type: {
            type: String,
            required: true,
            trim: true,
        },

        entity_id: {
            type: String,
            required: true,
            trim: true,
        },

        report_id: {
            type: String,
            default: null,
            trim: true,
        },

        proposal_id: {
            type: String,
            default: null,
            trim: true,
        },

        solution_id: {
            type: String,
            default: null,
            trim: true,
        },

        details: {
            type: String,
            default: "",
            trim: true,
        },

        created_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);