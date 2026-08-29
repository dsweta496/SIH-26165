const mongoose = require("mongoose");

const teamProposalSchema = new mongoose.Schema(
  {
    proposal_id: {
      type: String,
      required: true,
      unique: true,
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

    solution_proposal: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    admin_notes: {
      type: String,
      default: "",
      trim: true,
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

module.exports = mongoose.model("TeamProposal", teamProposalSchema);