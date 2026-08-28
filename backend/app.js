const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const problemReportRoutes = require("./routes/problemReport.route");

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

module.exports = app;