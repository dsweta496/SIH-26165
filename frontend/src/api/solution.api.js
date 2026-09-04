import api from "./axios";


export const createSolution =
    async (solutionData) => {

        const response = await api.post(
            "/solutions",
            solutionData
        );

        return response.data;
    };


export const getSolutionsForProposal =
    async (proposalId) => {

        const response = await api.get(
            `/solutions/proposal/${proposalId}`
        );

        return response.data;
    };


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


export const approveSolution =
    async (solutionId) => {

        const response = await api.patch(
            `/solutions/${solutionId}/approve`
        );

        return response.data;
    };


export const resubmitSolution =
    async (
        solutionId,
        solutionData
    ) => {

        const response = await api.post(
            `/solutions/${solutionId}/resubmit`,
            solutionData
        );

        return response.data;
    };