const express = require("express");

const {
    createSolution,
    getSolutionsForProposal,
    requestSolutionChanges,
    approveSolution,
    resubmitSolution,
} = require("../controllers/solution.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware("team"),
    upload.array("attachments", 5),
    createSolution
);

router.get(
    "/proposal/:proposalId",
    authMiddleware,
    roleMiddleware("admin"),
    getSolutionsForProposal
);

router.patch(
    "/:solutionId/request-changes",
    authMiddleware,
    roleMiddleware("admin"),
    requestSolutionChanges
);

router.patch(
    "/:solutionId/approve",
    authMiddleware,
    roleMiddleware("admin"),
    approveSolution
);

router.post(
    "/:solutionId/resubmit",
    authMiddleware,
    roleMiddleware("team"),
    upload.array("attachments", 5),
    resubmitSolution
);

module.exports = router;