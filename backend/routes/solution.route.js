const express = require("express");

const {
    createSolution,
    getSolutionsForProposal,
    requestSolutionChanges,
    approveSolution,
    resubmitSolution,
} = require("../controllers/solution.controller");

const router = express.Router();


// Submit a new solution
router.post("/", createSolution);


// Get all solution review cycles for a proposal
router.get(
    "/proposal/:proposalId",
    getSolutionsForProposal
);


// Admin requests changes
router.patch(
    "/:solutionId/request-changes",
    requestSolutionChanges
);


// Admin approves solution
router.patch(
    "/:solutionId/approve",
    approveSolution
);


// Team resubmits after changes requested
router.post(
    "/:solutionId/resubmit",
    resubmitSolution
);


module.exports = router;