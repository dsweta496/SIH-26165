const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        team_id: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
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

        status: {
            type: String,
            enum: ["pending", "active", "inactive"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Team", teamSchema);