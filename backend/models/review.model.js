const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        review_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        solution_id: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        proposal_id: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        report_id: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        team_id: {
            type: String,
            required: true,
            trim: true,
        },

        reviewer_id: {
            type: String,
            required: true,
            trim: true,
        },

        decision: {
            type: String,
            enum: [
                "changes_requested",
                "approved",
            ],
            required: true,
        },

        feedback: {
            type: String,
            default: "",
            trim: true,
        },

        review_cycle: {
            type: Number,
            required: true,
            min: 1,
        },

        reviewed_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Review", reviewSchema);