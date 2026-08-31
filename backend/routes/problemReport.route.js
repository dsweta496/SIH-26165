const express = require("express");

const {
    createProblemReport,
    getProblemReports,
    getPendingReports,
    getProblemReportById,
    reviewProblemReport,
} = require("../controllers/problemReport.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post(
    "/",
    upload.array("attachments", 5),
    createProblemReport
);

router.get("/", authMiddleware, roleMiddleware("admin"), getProblemReports);

router.get(
    "/pending",
    authMiddleware,
    roleMiddleware("admin"),
    getPendingReports
);

router.patch(
    "/:reportId/review",
    authMiddleware,
    roleMiddleware("admin"),
    reviewProblemReport
);

router.get("/:reportId", getProblemReportById);

module.exports = router;