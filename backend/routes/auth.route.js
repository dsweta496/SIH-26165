const express = require("express");

const {
  registerUser,
  loginUser,
  registerInvitedTeam,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post(
  "/register/invited-team",
  registerInvitedTeam
);

module.exports = router;