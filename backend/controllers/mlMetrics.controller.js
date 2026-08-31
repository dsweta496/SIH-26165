const MLResult = require("../models/mlResult.model");


// GET /api/ml/metrics
// Model + dataset version + evaluation metrics

const getMLMetrics = async (req, res) => {
    try {
        // MODEL VERSION
        
        const latestResult = await MLResult.findOne({})
            .sort({
                createdAt: -1,
            })
            .lean();


        const modelName =
            latestResult?.model_name || "MuRIL";

        const modelVersion =
            latestResult?.model_version ||
            "NOT_AVAILABLE";


        // DATA VERSION
        
        // The ML team has not supplied a finalized
        // dataset version yet.
        const dataVersion =
            "NOT_AVAILABLE";


        // EVALUATION METRICS
        
        const metrics = {
            extraction: {
                precision: null,
                recall: null,
                f1: null,
            },

            sif: {
                precision: null,
                recall: null,
                f1: null,
            },

            lsr: {
                multi_label_f1: null,
            },

            barrier: {
                macro_f1: null,
            },

            clustering: {
                cluster_purity: null,
                expert_validation: null,
            },

            trend: {
                expert_sanity_check: null,
            },

            sbri: {
                top_k_expert_agreement: null,
                usefulness: null,
            },
        };


        // RESULT COUNTS
        
        const totalResults =
            await MLResult.countDocuments();

        const reviewedResults =
            await MLResult.countDocuments({
                review_status: {
                    $in: [
                        "reviewed",
                        "corrected",
                    ],
                },
            });

        const correctedResults =
            await MLResult.countDocuments({
                review_status: "corrected",
            });


        // RESPONSE
        
        return res.status(200).json({
            success: true,

            data: {
                model: {
                    name: modelName,
                    version: modelVersion,
                },

                data_version: dataVersion,

                evaluated_at: null,

                metrics,

                result_statistics: {
                    total_results: totalResults,
                    reviewed_results: reviewedResults,
                    corrected_results: correctedResults,
                },
            },
        });

    } catch (error) {
        console.error(
            "Get ML metrics error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch ML metrics",
            error: error.message,
        });
    }
};


module.exports = {
    getMLMetrics,
};