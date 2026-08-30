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

const router = express.Router();


// TEAM — SUBMIT SOLUTION

router.post(
    "/",
    authMiddleware,
    roleMiddleware("team"),
    createSolution
);


// ADMIN — VIEW SOLUTION HISTORY

router.get(
    "/proposal/:proposalId",
    authMiddleware,
    roleMiddleware("admin"),
    getSolutionsForProposal
);


// ADMIN — REQUEST CHANGES

router.patch(
    "/:solutionId/request-changes",
    authMiddleware,
    roleMiddleware("admin"),
    requestSolutionChanges
);


// ADMIN — APPROVE SOLUTION

router.patch(
    "/:solutionId/approve",
    authMiddleware,
    roleMiddleware("admin"),
    approveSolution
);


// TEAM — RESUBMIT

router.post(
    "/:solutionId/resubmit",
    authMiddleware,
    roleMiddleware("team"),
    resubmitSolution
);


module.exports = router;