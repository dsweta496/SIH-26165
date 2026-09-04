const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
    getTeamDashboard,
    getTeamCurrentCases,
    getTeamResolvedCases,
    getTeamCaseDetails,
} = require("../controllers/team.controller");

const router = express.Router();


router.get(
    "/dashboard",
    authMiddleware,
    getTeamDashboard
);


router.get(
    "/cases/current",
    authMiddleware,
    getTeamCurrentCases
);


router.get(
    "/cases/resolved",
    authMiddleware,
    getTeamResolvedCases
);


router.get(
    "/cases/:reportId",
    authMiddleware,
    getTeamCaseDetails
);


module.exports = router;