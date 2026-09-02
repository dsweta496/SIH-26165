const express = require("express");

const {
    exportReportsCSV,exportResolvedCasesCSV
} = require("../controllers/export.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const router = express.Router();

// ADMIN — EXPORT REPORT + ML DATASET

router.get(
    "/reports/csv",
    authMiddleware,
    roleMiddleware("admin"),
    exportReportsCSV
);

// ADMIN — EXPORT RESOLVED CASE HISTORY

router.get(
    "/resolved-cases/csv",
    authMiddleware,
    roleMiddleware("admin"),
    exportResolvedCasesCSV
);


module.exports = router;