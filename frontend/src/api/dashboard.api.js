import api from "./axios";

export const getDashboardOverview = async () => {
    const response = await api.get("/dashboard/overview");

    return response.data;
};

export const getDistressRanking = async () => {
    const response = await api.get(
        "/dashboard/distress-ranking"
    );

    return response.data;
};

export const getDashboardTrends = async () => {
    const response = await api.get(
        "/dashboard/trends"
    );

    return response.data;
};

export const getDashboardTimeMetrics = async () => {
    const response = await api.get(
        "/dashboard/time-metrics"
    );

    return response.data;
};