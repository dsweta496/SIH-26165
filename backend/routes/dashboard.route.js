const express = require("express");

const {
    getDashboardOverview,
    getDashboardDistressRanking,
    getDashboardTrends,
    getDashboardTimeMetrics,
} = require("../controllers/dashboard.controller");

const router = express.Router();


// PUBLIC — DASHBOARD OVERVIEW

router.get(
    "/overview",
    getDashboardOverview
);


// PUBLIC — DISTRESS RANKING

router.get(
    "/distress-ranking",
    getDashboardDistressRanking
);


// PUBLIC — DASHBOARD TRENDS

router.get(
    "/trends",
    getDashboardTrends
);


// PUBLIC — TIME METRICS

router.get(
    "/time-metrics",
    getDashboardTimeMetrics
);


module.exports = router;