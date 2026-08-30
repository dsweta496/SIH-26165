const express = require("express");

const {
    getAdminOverview,
    getAdminReviewQueue,
    getActiveCases,
    getPendingSolutions,
} = require("../controllers/admin.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const router = express.Router();



// ADMIN OVERVIEW


router.get(
    "/overview",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminOverview
);



// ADMIN REVIEW QUEUE


router.get(
    "/review-queue",
    authMiddleware,
    roleMiddleware("admin"),
    getAdminReviewQueue
);



// ACTIVE CASES


router.get(
    "/active-cases",
    authMiddleware,
    roleMiddleware("admin"),
    getActiveCases
);



// PENDING SOLUTIONS


router.get(
    "/pending-solutions",
    authMiddleware,
    roleMiddleware("admin"),
    getPendingSolutions
);


module.exports = router;