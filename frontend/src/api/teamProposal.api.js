import api from "./axios";


/* =========================================================
   CREATE TEAM PROPOSAL
========================================================= */

export const createTeamProposal = async (payload) => {
    const response = await api.post("/proposals", payload);
    return response.data;
};

/* =========================================================
   GET PROPOSALS FOR A PROBLEM REPORT
========================================================= */

export const getProposalsForReport =
    async (reportId) => {
        const response = await api.get(
            `/proposals/report/${reportId}`
        );

        return response.data;
    };


/* =========================================================
   ACCEPT TEAM PROPOSAL
========================================================= */

export const acceptTeamProposal =
    async (proposalId) => {
        const response = await api.patch(`/proposals/${proposalId}/accept`)

        return response.data;
    };


/* =========================================================
   REJECT TEAM PROPOSAL
========================================================= */

export const rejectTeamProposal =
    async (
        proposalId,
        adminNotes = ""
    ) => {
        const response = await api.patch(`/proposals/${proposalId}/reject`,
            {
                admin_notes: adminNotes,
            }
        );

        return response.data;
    };