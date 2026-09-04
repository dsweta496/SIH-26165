const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const problemReportRoutes = require("./routes/problemReport.route");
const teamProposalRoutes = require("./routes/teamProposal.route");
const authRoutes = require("./routes/auth.route");
const teamInvitationRoutes = require("./routes/teamInvitation.route");
const solutionRoutes = require("./routes/solution.route");
const adminRoutes = require("./routes/admin.route");
const dashboardRoutes = require("./routes/dashboard.route");
const mlRoutes = require("./routes/ml.route");
const mlReviewRoutes = require("./routes/mlReview.route");
const exportRoutes = require("./routes/export.route");
const teamRoutes = require("./routes/team.route");
const app = express();

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

// Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "OIL SIF backend is running",
  });
});

app.use("/api/reports", problemReportRoutes);

app.use("/api/proposals", teamProposalRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/invitations", teamInvitationRoutes);

app.use("/api/solutions", solutionRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/ml", mlRoutes);

app.use("/api/ml", mlReviewRoutes);

app.use("/api/export", exportRoutes);

app.use("/api/team", teamRoutes);

module.exports = app;