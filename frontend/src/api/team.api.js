import api from "./axios";


export const getTeamDashboardStats = async () => {
    const response = await api.get("/team/dashboard");

    return response.data;
};


export const getTeamCurrentCases = async () => {
    const response = await api.get("/team/cases/current");

    return response.data;
};


export const getTeamResolvedCases = async () => {
    const response = await api.get("/team/cases/resolved");

    return response.data;
};


export const getTeamCaseDetails = async (reportId) => {
    const response = await api.get(
        `/team/cases/${reportId}`
    );

    return response.data;
};