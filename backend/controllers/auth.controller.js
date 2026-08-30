const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user.model");
const Team = require("../models/team.model");
const TeamProposal = require("../models/teamProposal.model");
const TeamInvitation = require("../models/teamInvitation.model");

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      team_id,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    if (!["admin", "team"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    if (role === "team" && !team_id) {
      return res.status(400).json({
        success: false,
        message: "team_id is required for team users",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      team_id: role === "team" ? team_id : null,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        team_id: user.team_id,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    console.error("Register user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to register user",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        team_id: user.team_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          team_id: user.team_id,
          is_active: user.is_active,
        },
      },
    });
  } catch (error) {
    console.error("Login user error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};

const registerInvitedTeam = async (req, res) => {
  try {
    const {
      token,
      name,
      email,
      password,
    } = req.body;

    if (!token || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Invitation token, name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const invitation = await TeamInvitation.findOne({
      token_hash: tokenHash,
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: "Invalid invitation token",
      });
    }

    if (invitation.used) {
      return res.status(400).json({
        success: false,
        message: "This invitation has already been used",
      });
    }

    if (new Date() > invitation.expires_at) {
      return res.status(400).json({
        success: false,
        message: "This invitation has expired",
      });
    }

    const submittedEmail = email.toLowerCase();
    const invitedEmail =
      invitation.team_leader_email.toLowerCase();

    if (submittedEmail !== invitedEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Email does not match the email associated with this invitation",
      });
    }

    const existingUser = await User.findOne({
      email: submittedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const proposal = await TeamProposal.findOne({
      proposal_id: invitation.proposal_id,
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: "Associated proposal not found",
      });
    }

    if (proposal.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message:
          "The associated proposal has not been accepted",
      });
    }

    if (proposal.team_id) {
      return res.status(400).json({
        success: false,
        message:
          "This proposal is already linked to a registered team",
      });
    }

    const existingTeam = await Team.findOne({
      team_name: invitation.team_name,
    });

    if (existingTeam) {
      return res.status(409).json({
        success: false,
        message:
          "A team with this name already exists",
      });
    }

    const teamId = `TEAM-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

    const team = await Team.create({
      team_id: teamId,
      team_name: invitation.team_name,
      team_leader_email: invitation.team_leader_email,
      status: "active",
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: submittedEmail,
      password: hashedPassword,
      role: "team",
      team_id: team.team_id,
    });

    proposal.team_id = team.team_id;

    await proposal.save();

    const ProblemReport = require("../models/problemReport.model");

    const report = await ProblemReport.findOne({
      report_id: proposal.report_id,
    });

    if (report) {
      report.assigned_team = team.team_id;
      await report.save();
    }

    invitation.used = true;
    invitation.used_at = new Date();

    await invitation.save();

    return res.status(201).json({
      success: true,
      message:
        "Team registration completed successfully",
      data: {
        team: {
          team_id: team.team_id,
          team_name: team.team_name,
          team_leader_email: team.team_leader_email,
          status: team.status,
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          team_id: user.team_id,
          is_active: user.is_active,
        },
        proposal_id: proposal.proposal_id,
      },
    });
  } catch (error) {
    console.error(
      "Invited team registration error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to complete invited team registration",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  registerInvitedTeam,
};