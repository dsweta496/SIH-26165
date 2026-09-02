import api from "./axios";


/* =========================================================
   GET PENDING PROBLEM REPORTS
========================================================= */

export const getPendingProblemReports =
    async () => {
        const response = await api.get(
            "/reports/pending"
        );

        return response.data;
    };


/* =========================================================
   GET SINGLE PROBLEM REPORT
========================================================= */

export const getProblemReportById =
    async (reportId) => {
        const response = await api.get(
            `/reports/${reportId}`
        );

        return response.data;
    };


/* =========================================================
   REVIEW PROBLEM REPORT
========================================================= */

export const reviewProblemReport =
    async (
        reportId,
        reviewStatus,
        reviewerNotes = ""
    ) => {
        const response = await api.patch(
            `/reports/${reportId}/review`,
            {
                review_status: reviewStatus,
                reviewer_notes: reviewerNotes,
            }
        );

        return response.data;
    };