const express = require("express");

const {
    verifyTeamInvitation,
} = require("../controllers/teamInvitation.controller");

const router = express.Router();

router.get("/verify", verifyTeamInvitation);

module.exports = router;