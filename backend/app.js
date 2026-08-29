const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const problemReportRoutes = require("./routes/problemReport.route");
const teamProposalRoutes = require("./routes/teamProposal.route");
const authRoutes = require("./routes/auth.route");
const authMiddleware = require("./middleware/auth.middleware");
const roleMiddleware = require("./middleware/role.middleware");

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

module.exports = app;