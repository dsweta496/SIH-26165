import api from "./axios";


/* =========================================================
   GET ML RESULT FOR A REPORT
========================================================= */

export const getMLResultByReportId =
    async (reportId) => {

        const response =
            await api.get(
                `/ml/report/${reportId}`
            );

        return response.data;
    };


/* =========================================================
   GET ML MODEL / DATASET / RESULT STATISTICS
========================================================= */

export const getMLMetrics =
    async () => {

        const response =
            await api.get(
                "/ml/metrics"
            );

        return response.data;
    };


/* =========================================================
   GET ALL PRECURSOR CLUSTERS
========================================================= */

export const getMLClusters =
    async () => {

        const response =
            await api.get(
                "/ml/clusters"
            );

        return response.data;
    };


/* =========================================================
   GET SINGLE PRECURSOR CLUSTER
========================================================= */

export const getMLClusterById =
    async (clusterId) => {

        const response =
            await api.get(
                `/ml/clusters/${clusterId}`
            );

        return response.data;
    };


/* =========================================================
   GET SITE-LEVEL ML AGGREGATES
========================================================= */

export const getMLSites =
    async () => {

        const response =
            await api.get(
                "/ml/sites"
            );

        return response.data;
    };


/* =========================================================
   HUMAN REVIEW OF ML RESULT
========================================================= */

export const reviewMLResult =
    async ({
        reportId,
        modelVersion,
        decision,
        corrections = {},
        correctionNotes = "",
    }) => {

        const response =
            await api.post(
                "/ml/review",
                {
                    report_id:
                        reportId,

                    model_version:
                        modelVersion,

                    decision,

                    corrections,

                    correction_notes:
                        correctionNotes,
                }
            );

        return response.data;
    };