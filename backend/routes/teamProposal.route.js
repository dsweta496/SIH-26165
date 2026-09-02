const express = require("express");

const {
  createTeamProposal,
  getProposalsForReport,
  acceptTeamProposal,
  rejectTeamProposal,
} = require("../controllers/teamProposal.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/", upload.array("attachments", 5), createTeamProposal);

router.get(
    "/report/:reportId",
    authMiddleware,
    roleMiddleware("admin"),
    getProposalsForReport
);


router.patch(
    "/:proposalId/accept",
    authMiddleware,
    roleMiddleware("admin"),
    acceptTeamProposal
);

router.patch(
    "/:proposalId/reject",
    authMiddleware,
    roleMiddleware("admin"),
    rejectTeamProposal
);

module.exports = router;