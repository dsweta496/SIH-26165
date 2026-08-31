const express = require("express");

const {
    analyzeReport,
    classifyReport,
    assignCluster,
    getClusters,
    getClusterById,
    getSiteAggregates,
} = require("../controllers/ml.controller");

const {
    getMLMetrics,
} = require("../controllers/mlMetrics.controller");

const router = express.Router();


// ML ANALYSIS

router.post(
    "/analyze",
    analyzeReport
);


// ML CLASSIFICATION

router.post(
    "/classify",
    classifyReport
);


// PRECURSOR CLUSTER

router.post(
    "/cluster",
    assignCluster
);


// PRECURSOR CLUSTERS

router.get(
    "/clusters",
    getClusters
);


// IMPORTANT:
// /clusters/:id must come after /clusters

router.get(
    "/clusters/:id",
    getClusterById
);


// SITE AGGREGATES

router.get(
    "/sites",
    getSiteAggregates
);

router.get(
    "/metrics",
    getMLMetrics
);

module.exports = router;