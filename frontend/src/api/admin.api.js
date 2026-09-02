import api from "./axios";

export const getAdminOverview = async () => {
    const response = await api.get(
        "/admin/overview"
    );

    return response.data;
};


export const getAdminReviewQueue = async () => {
    const response = await api.get(
        "/admin/review-queue"
    );

    return response.data;
};


export const getActiveCases = async () => {
    const response = await api.get(
        "/admin/active-cases"
    );

    return response.data;
};


export const getPendingSolutions = async () => {
    const response = await api.get(
        "/admin/pending-solutions"
    );

    return response.data;
};