const express = require("express");

const {
  createProblemReport,
  getDashboardStatistics,
  getProblemReports,
  getPendingReports,
  getProblemReportById,
  reviewProblemReport,
  getDistressRanking,
} = require("../controllers/problemReport.controller");

const router = express.Router();

router.post("/", createProblemReport);

router.get("/", getProblemReports);

router.get("/pending", getPendingReports);

router.patch("/:reportId/review", reviewProblemReport);

router.get("/ranking/distress", getDistressRanking);

router.get("/statistics/dashboard", getDashboardStatistics);

router.get("/:reportId", getProblemReportById);

module.exports = router;