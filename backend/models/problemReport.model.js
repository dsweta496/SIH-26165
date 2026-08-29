const mongoose = require("mongoose");

const problemReportSchema = new mongoose.Schema(
    {
        report_id: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        report_type: {
            type: String,
            enum: [
                "UA/UC",
                "Near Miss",
                "Incident",
            ],
            required: true,
            index: true,
        },

        source_type: {
            type: String,
            enum: ["OISD", "synthetic", "gold", "user_report"],
            required: true,
        },

        source_reference: {
            type: String,
            required: true,
        },

        report_date: {
            type: Date,
            default: Date.now,
        },

        site: {
            type: String,
        },

        activity: {
            type: String,
            required: true,
            index: true,
        },

        location: {
            type: String,
            default: "NOT_STATED",
        },

        equipment: {
            type: String,
            default: "NOT_STATED",
        },

        report_text: {
            type: String,
            required: true,
        },

        language_style: {
            type: String,
            enum: ["English", "Hindi", "Hinglish", "Mixed"],
            required: true,
        },

        hazard: {
            type: String,
            required: true,
        },

        energy_source: {
            type: [String],
            required: true,
        },

        exposure: {
            type: String,
            required: true,
        },

        unsafe_act_condition: {
            type: String,
            required: true,
        },

        barrier_or_control: {
            type: String,
            required: true,
        },

        barrier_failure_mode: {
            type: String,
            enum: [
                "missing",
                "bypassed",
                "degraded",
                "unverified",
                "none",
            ],
            required: true,
        },

        barrier_function: {
            type: String,
            enum: [
                "prevention",
                "detection",
                "control",
                "mitigation",
            ],
            required: true,
        },

        potential_consequence: {
            type: String,
            required: true,
        },

        actual_outcome: {
            type: String,
        },

        immediate_action: {
            type: String,
            default: "",
        },

        sif_potential: {
            type: Boolean,
            default: false,
            index: true,
        },

        sif_level: {
            type: String,
            enum: ["Low", "Medium", "High"],
        },

        lsr_tags: {
            type: [String],
            default: [],
            index: true,
        },

        evidence_phrases: {
            type: [String],
            default: [],
        },

        gold_source: {
            type: Boolean,
            default: false,
        },

        reviewer_notes: {
            type: String,
        },

        scenario_family: {
            type: String,
            index: true,
        },

        review_status: {
            type: String,
            enum: ["pending_review", "approved", "rejected"],
            default: "pending_review",
            index: true,
        },

        case_status: {
            type: String,
            enum: ["active", "assigned", "resolved"],
            default: "active",
            index: true,
        },

        assigned_team: {
            type: String,
            default: null
        },

        resolved_at: {
            type: Date,
            default: null,
        },

        attachments: {
            type: [
                {
                    name: {
                        type: String,
                    },
                    url: {
                        type: String,
                    },
                    type: {
                        type: String,
                    },
                    size: {
                        type: Number,
                    },
                },
            ],
            default: [],
        },

        sif_score: {
            type: Number,
            default: null,
            min: 0,
            max: 100,
        },

        iogp_rule: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("ProblemReport", problemReportSchema);