const mongoose = require("mongoose");

const problemReportSchema = new mongoose.Schema(
    {
        report_id: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        source_type: {
            type: String,
            enum: [
                "OISD",
                "synthetic",
                "gold",
                "user_report",
            ],
            required: true,
            index: true,
        },

        source_reference: {
            type: String,
            default: "",
            trim: true,
        },

        organization: {
            type: String,
            default: "",
            trim: true,
        },

        sector: {
            type: String,
            default: "",
            trim: true,
        },

        site: {
            type: String,
            default: "",
            index: true,
            trim: true,
        },

        incident_serial_no: {
            type: String,
            default: "",
            trim: true,
        },

        report_date: {
            type: Date,
            default: Date.now,
            index: true,
        },

        incident_time: {
            type: String,
            default: "",
            trim: true,
        },

        incident_classification: {
            type: String,
            enum: [
                "major",
                "minor",
                "nearmiss",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
            index: true,
        },

        report_stage: {
            type: String,
            enum: [
                "preliminary",
                "final",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },

        incident_category: {
            type: String,
            enum: [
                "fire",
                "accident",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },

        fire_duration_hours: {
            type: Number,
            default: null,
            min: 0,
        },

        fire_duration_minutes: {
            type: Number,
            default: null,
            min: 0,
            max: 59,
        },

        incident_type: {
            type: String,
            default: "NOT_STATED",
            trim: true,
            index: true,
        },

        incident_location: {
            type: String,
            default: "NOT_STATED",
            trim: true,
        },

        facility_shutdown: {
            type: Boolean,
            default: null,
        },

        facility_outage: {
            type: Boolean,
            default: null,
        },

        fatalities: {
            employees: {
                type: Number,
                default: 0,
                min: 0,
            },
            contractors: {
                type: Number,
                default: 0,
                min: 0,
            },
            others: {
                type: Number,
                default: 0,
                min: 0,
            },
        },

        injuries: {
            employees: {
                type: Number,
                default: 0,
                min: 0,
            },
            contractors: {
                type: Number,
                default: 0,
                min: 0,
            },
            others: {
                type: Number,
                default: 0,
                min: 0,
            },
        },

        man_hours_lost: {
            employees: {
                type: Number,
                default: 0,
                min: 0,
            },
            contractors: {
                type: Number,
                default: 0,
                min: 0,
            },
            others: {
                type: Number,
                default: 0,
                min: 0,
            },
        },

        direct_loss_in_lakhs: {
            type: Number,
            default: null,
            min: 0,
        },

        indirect_loss: {
            type: String,
            default: "",
            trim: true,
        },

        facility_status: {
            type: String,
            enum: [
                "construction",
                "commissioning",
                "operation",
                "shutting_down",
                "turnaround",
                "maintenance",
                "startup",
                "other",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
            index: true,
        },

        activity: {
            type: String,
            default: "NOT_STATED",
            index: true,
            trim: true,
        },

        location: {
            type: String,
            default: "NOT_STATED",
            trim: true,
        },

        equipment: {
            type: String,
            default: "NOT_STATED",
            trim: true,
        },

        report_text: {
            type: String,
            required: true,
            trim: true,
        },

        post_incident_measures: {
            type: String,
            default: "",
            trim: true,
        },

        similar_incident_occurred: {
            type: Boolean,
            default: null,
        },

        similar_incident_description: {
            type: String,
            default: "",
            trim: true,
        },

        internal_investigation_completed: {
            type: Boolean,
            default: null,
        },

        internal_investigation_completion_date: {
            type: Date,
            default: null,
        },

        internal_investigation_report_submitted_to_oisd: {
            type: Boolean,
            default: null,
        },

        expected_oisd_submission_date: {
            type: Date,
            default: null,
        },

        cause_of_incident: {
            type: [String],
            default: [],
        },

        leakage_cause: {
            type: String,
            enum: [
                "weld_leak",
                "flange_gland_leak",
                "rotary_equipment",
                "metallurgical_failure",
                "improper_operation",
                "improper_maintenance",
                "normal_operation_venting_draining",
                "other",
                "not_applicable",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },

        leakage_cause_details: {
            type: String,
            default: "",
            trim: true,
        },

        ignition_cause: {
            type: String,
            enum: [
                "hot_work",
                "furnace_flare",
                "auto_ignition",
                "loose_electrical_connection",
                "hot_surface",
                "static_electricity",
                "hammering_falling_object",
                "friction",
                "lightning",
                "other",
                "not_applicable",
                "NOT_STATED",
            ],
            default: "NOT_STATED",
        },

        ignition_cause_details: {
            type: String,
            default: "",
            trim: true,
        },

        avoidable: {
            type: Boolean,
            default: null,
        },

        avoidance_factors: {
            type: [String],
            default: [],
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
            trim: true,
        },

        energy_source: {
            type: [String],
            default: [],
        },

        exposure: {
            type: String,
            default: "NOT_STATED",
            trim: true,
        },

        unsafe_act_condition: {
            type: String,
            default: "NOT_STATED",
            trim: true,
        },

        barrier_or_control: {
            type: String,
            default: "NOT_STATED",
            trim: true,
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
            trim: true,
        },

        actual_outcome: {
            type: String,
            default: "NOT_STATED",
            trim: true,
        },

        sif_potential: {
            type: Boolean,
            default: false,
            index: true,
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
            index: true,
        },

        sif_score: {
            type: Number,
            default: null,
            min: 0,
            max: 100,
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

        scenario_family: {
            type: String,
            default: "",
            index: true,
            trim: true,
        },

        gold_source: {
            type: Boolean,
            default: false,
            index: true,
        },

        iogp_rule: {
            type: String,
            default: null,
            trim: true,
        },

        reviewer_notes: {
            type: String,
            default: "",
            trim: true,
        },

        review_status: {
            type: String,
            enum: [
                "pending_review",
                "approved",
                "rejected",
            ],
            default: "pending_review",
            index: true,
        },

        case_status: {
            type: String,
            enum: [
                "active",
                "assigned",
                "resolved",
            ],
            default: "active",
            index: true,
        },

        assigned_team: {
            type: String,
            default: null,
            index: true,
            trim: true,
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
                        required: true,
                    },
                    url: {
                        type: String,
                        required: true,
                    },
                    type: {
                        type: String,
                        default: "application/octet-stream",
                    },
                    size: {
                        type: Number,
                        default: 0,
                        min: 0,
                    },
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

problemReportSchema.index({
    review_status: 1,
    case_status: 1,
});

problemReportSchema.index({
    site: 1,
    activity: 1,
});

problemReportSchema.index({
    report_date: -1,
});

problemReportSchema.index({
    sif_potential: 1,
    sif_level: 1,
});

module.exports = mongoose.model(
    "ProblemReport",
    problemReportSchema
);