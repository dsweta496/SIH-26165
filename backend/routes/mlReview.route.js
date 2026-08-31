const express = require("express");

const {
    reviewMLResult,
} = require("../controllers/mlReview.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

const router = express.Router();


// ADMIN — REVIEW / CORRECT ML RESULT

router.post(
    "/review",
    authMiddleware,
    roleMiddleware("admin"),
    reviewMLResult
);


module.exports = router;