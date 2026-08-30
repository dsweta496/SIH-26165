const mongoose = require("mongoose");

const solutionSchema = new mongoose.Schema(
    {
        solution_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        proposal_id: {
            type: String,
            required: true,
            trim: true,
        },

        report_id: {
            type: String,
            required: true,
            trim: true,
        },

        team_id: {
            type: String,
            required: true,
            trim: true,
        },

        solution_text: {
            type: String,
            required: true,
            trim: true,
        },

        attachments: [
            {
                name: {
                    type: String,
                    required: true,
                },

                url: {
                    type: String,
                    required: true,
                },

                type: {
                    type: String,
                    required: true,
                },

                size: {
                    type: Number,
                    required: true,
                },
            },
        ],

        status: {
            type: String,
            enum: [
                "pending_review",
                "changes_requested",
                "approved",
            ],
            default: "pending_review",
        },

        admin_feedback: {
            type: String,
            default: "",
            trim: true,
        },

        review_cycle: {
            type: Number,
            default: 1,
            min: 1,
        },

        submitted_at: {
            type: Date,
            default: Date.now,
        },

        reviewed_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Solution", solutionSchema);