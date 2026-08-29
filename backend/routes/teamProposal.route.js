const express = require("express");

const {
  createTeamProposal,
  getProposalsForReport,
  acceptTeamProposal,
  rejectTeamProposal,
} = require("../controllers/teamProposal.controller");

const router = express.Router();

router.post("/", createTeamProposal);

router.get("/report/:reportId", getProposalsForReport);

router.patch("/:proposalId/accept", acceptTeamProposal);

router.patch("/:proposalId/reject", rejectTeamProposal);

module.exports = router;