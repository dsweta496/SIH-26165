import api from "./axios";

export const getProblemReport = async (reportId) => {
    const response = await api.get(
        `/reports/${reportId}`
    );

    return response.data;
};

export const submitProblemReport = async (data) => {
    const response = await api.post(
        "/reports",
        data
    );

    return response.data;
};

export const submitProposal = async (data) => {
    const response = await api.post(
        "/proposals",
        data
    );

    return response.data;
};