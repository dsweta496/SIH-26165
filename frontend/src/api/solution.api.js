import api from "./axios";


/* =========================================================
   GET SOLUTIONS FOR A PROPOSAL
========================================================= */

export const getSolutionsForProposal =
    async (proposalId) => {

        const response = await api.get(
            `/solutions/proposal/${proposalId}`
        );

        return response.data;
    };


/* =========================================================
   REQUEST CHANGES
========================================================= */

export const requestSolutionChanges =
    async (
        solutionId,
        adminFeedback
    ) => {

        const response = await api.patch(
            `/solutions/${solutionId}/request-changes`,
            {
                admin_feedback: adminFeedback,
            }
        );

        return response.data;
    };


/* =========================================================
   APPROVE SOLUTION
========================================================= */

export const approveSolution =
    async (solutionId) => {

        const response = await api.patch(
            `/solutions/${solutionId}/approve`
        );

        return response.data;
    };