const mongoose = require("mongoose");


// ==========================================
// ML RESULT SCHEMA
// ==========================================

const mlResultSchema = new mongoose.Schema(
    {
                // REPORT REFERENCE
        
        report_id: {
            type: String,
            required: true,
            index: true,
        },


                // MODEL INFORMATION
        
        model_name: {
            type: String,
            default: "MuRIL",
        },

        model_version: {
            type: String,
            required: true,
        },


                // STRUCTURED SAFETY EXTRACTION
        
        activity: {
            type: String,
            default: "NOT_STATED",
        },

        location: {
            type: String,
            default: "NOT_STATED",
        },

        equipment: {
            type: String,
            default: "NOT_STATED",
        },

        language_style: {
            type: String,
            enum: [
                "English",
                "Hindi",
                "Hinglish",
                "Mixed",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },

        hazard: {
            type: String,
            default: "NOT_STATED",
        },

        energy_source: {
            type: [String],
            default: [],
        },

        exposure: {
            type: String,
            default: "NOT_STATED",
        },

        unsafe_act_condition: {
            type: String,
            default: "NOT_STATED",
        },

        barrier_or_control: {
            type: String,
            default: "NOT_STATED",
        },

        barrier_failure_mode: {
            type: String,
            enum: [
                "missing",
                "bypassed",
                "degraded",
                "unverified",
                "none",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },

        barrier_function: {
            type: String,
            enum: [
                "prevention",
                "detection",
                "control",
                "mitigation",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },

        potential_consequence: {
            type: String,
            default: "NOT_STATED",
        },

        actual_outcome: {
            type: String,
            default: "NOT_STATED",
        },


                // SIF INTELLIGENCE
        
        sif_potential: {
            type: Boolean,
            required: true,
        },

        sif_confidence: {
            type: Number,
            min: 0,
            max: 1,
            required: true,
        },

        sif_level: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },


                // IOGP LIFE-SAVING RULES
        
        lsr_tags: {
            type: [String],
            default: [],
        },


                // EVIDENCE
        
        evidence_phrases: {
            type: [String],
            default: [],
        },


                // TEMPORAL / PRECURSOR INTELLIGENCE
        
        cluster_id: {
            type: String,
            default: null,
            index: true,
        },

        recurrence_count: {
            type: Number,
            default: 0,
            min: 0,
        },

        trend: {
            type: String,
            enum: [
                "stable",
                "increasing",
                "decreasing",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },

        barrier_health: {
            type: String,
            enum: [
                "healthy",
                "degrading",
                "critical",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },


                // SBRI
        
        sbri_score: {
            type: Number,
            min: 0,
            max: 1,
            default: null,
        },

        sbri_drivers: {
            severity: {
                type: Number,
                min: 0,
                max: 1,
                default: null,
            },

            exposure: {
                type: Number,
                min: 0,
                max: 1,
                default: null,
            },

            barrier_criticality: {
                type: Number,
                min: 0,
                max: 1,
                default: null,
            },

            recurrence: {
                type: Number,
                min: 0,
                max: 1,
                default: null,
            },

            trend: {
                type: Number,
                min: 0,
                max: 1,
                default: null,
            },
        },


                // HUMAN REVIEW / CORRECTION
        
        review_status: {
            type: String,
            enum: [
                "pending_review",
                "reviewed",
                "corrected",
            ],
            default: "pending_review",
        },

        reviewed_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        reviewed_at: {
            type: Date,
            default: null,
        },

        correction_notes: {
            type: String,
            default: "",
        },
        human_corrections: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },

    {
        timestamps: true,
    }
);


module.exports = mongoose.model(
    "MLResult",
    mlResultSchema
);