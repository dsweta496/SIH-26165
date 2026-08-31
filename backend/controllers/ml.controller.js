const ProblemReport = require("../models/problemReport.model");
const MLResult = require("../models/mlResult.model");


// POST /api/ml/analyze
// Store structured extraction from ML service

const analyzeReport = async (req, res) => {
    try {
        const {
            report_id,
            model_name,
            model_version,
            activity,
            location,
            equipment,
            language_style,
            hazard,
            energy_source,
            exposure,
            unsafe_act_condition,
            barrier_or_control,
            barrier_failure_mode,
            barrier_function,
            potential_consequence,
            actual_outcome,
            evidence_phrases,
        } = req.body;

        if (!report_id || !model_version) {
            return res.status(400).json({
                success: false,
                message:
                    "report_id and model_version are required",
            });
        }

        const report = await ProblemReport.findOne({
            report_id,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Problem report not found",
            });
        }

        const result = await MLResult.findOneAndUpdate(
            {
                report_id,
                model_version,
            },
            {
                report_id,
                model_name,
                model_version,
                activity,
                location,
                equipment,
                language_style,
                hazard,
                energy_source,
                exposure,
                unsafe_act_condition,
                barrier_or_control,
                barrier_failure_mode,
                barrier_function,
                potential_consequence,
                actual_outcome,
                evidence_phrases,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "ML analysis stored successfully",
            data: result,
        });
    } catch (error) {
        console.error(
            "ML analyze error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to store ML analysis",
            error: error.message,
        });
    }
};


// POST /api/ml/classify
// Store SIF + LSR + barrier classification

const classifyReport = async (req, res) => {
    try {
        const {
            report_id,
            model_version,
            sif_potential,
            sif_confidence,
            sif_level,
            lsr_tags,
            barrier_or_control,
            barrier_failure_mode,
            barrier_function,
        } = req.body;

        if (
            !report_id ||
            !model_version ||
            sif_potential === undefined ||
            sif_confidence === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "report_id, model_version, sif_potential and sif_confidence are required",
            });
        }

        const report = await ProblemReport.findOne({
            report_id,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Problem report not found",
            });
        }

        const result = await MLResult.findOneAndUpdate(
            {
                report_id,
                model_version,
            },
            {
                report_id,
                model_version,
                sif_potential,
                sif_confidence,
                sif_level,
                lsr_tags,
                barrier_or_control,
                barrier_failure_mode,
                barrier_function,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "ML classification stored successfully",
            data: result,
        });
    } catch (error) {
        console.error(
            "ML classify error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to store ML classification",
            error: error.message,
        });
    }
};


// POST /api/ml/cluster
// Attach precursor cluster information

const assignCluster = async (req, res) => {
    try {
        const {
            report_id,
            model_version,
            cluster_id,
            recurrence_count,
            trend,
            barrier_health,
            sbri_score,
            sbri_drivers,
        } = req.body;

        if (
            !report_id ||
            !model_version ||
            !cluster_id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "report_id, model_version and cluster_id are required",
            });
        }

        const result = await MLResult.findOneAndUpdate(
            {
                report_id,
                model_version,
            },
            {
                cluster_id,
                recurrence_count,
                trend,
                barrier_health,
                sbri_score,
                sbri_drivers,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "ML result not found for report",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Precursor cluster assigned successfully",
            data: result,
        });
    } catch (error) {
        console.error(
            "ML cluster error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to assign precursor cluster",
            error: error.message,
        });
    }
};


// GET /api/ml/clusters
// Ranked precursor clusters

const getClusters = async (req, res) => {
    try {
        const {
            trend,
            barrier_health,
        } = req.query;

        const match = {
            cluster_id: {
                $ne: null,
            },
        };

        if (trend) {
            match.trend = trend;
        }

        if (barrier_health) {
            match.barrier_health = barrier_health;
        }

        const clusters = await MLResult.aggregate([
            {
                $match: match,
            },
            {
                $group: {
                    _id: "$cluster_id",

                    report_count: {
                        $sum: 1,
                    },

                    unique_sites: {
                        $addToSet: "$location",
                    },

                    sbri_score: {
                        $max: "$sbri_score",
                    },

                    trend: {
                        $last: "$trend",
                    },

                    barrier_health: {
                        $last: "$barrier_health",
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    cluster_id: "$_id",
                    report_count: 1,

                    unique_sites: {
                        $size: "$unique_sites",
                    },

                    sbri_score: 1,
                    trend: 1,
                    barrier_health: 1,
                },
            },
            {
                $sort: {
                    sbri_score: -1,
                    report_count: -1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            count: clusters.length,
            data: clusters,
        });
    } catch (error) {
        console.error(
            "Get ML clusters error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch precursor clusters",
            error: error.message,
        });
    }
};


// GET /api/ml/clusters/:id
// Cluster drill-down

const getClusterById = async (req, res) => {
    try {
        const { id } = req.params;

        const results = await MLResult.find({
            cluster_id: id,
        })
            .sort({
                sbri_score: -1,
                createdAt: -1,
            })
            .lean();

        if (!results.length) {
            return res.status(404).json({
                success: false,
                message: "Precursor cluster not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                cluster_id: id,
                report_count: results.length,
                results,
            },
        });
    } catch (error) {
        console.error(
            "Get ML cluster error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch precursor cluster",
            error: error.message,
        });
    }
};


// GET /api/ml/sites
// Site-level aggregates

const getSiteAggregates = async (req, res) => {
    try {
        const {
            site,
            activity,
            lsr,
        } = req.query;

        const match = {};

        if (site) {
            match.location = site;
        }

        if (activity) {
            match.activity = activity;
        }

        if (lsr) {
            match.lsr_tags = lsr;
        }

        const sites = await MLResult.aggregate([
            {
                $match: match,
            },
            {
                $group: {
                    _id: "$location",

                    report_count: {
                        $sum: 1,
                    },

                    average_sbri: {
                        $avg: "$sbri_score",
                    },

                    high_sif_count: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$sif_level",
                                        "High",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },

                    critical_barrier_count: {
                        $sum: {
                            $cond: [
                                {
                                    $eq: [
                                        "$barrier_health",
                                        "critical",
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    site: "$_id",
                    report_count: 1,
                    average_sbri: 1,
                    high_sif_count: 1,
                    critical_barrier_count: 1,
                },
            },
            {
                $sort: {
                    average_sbri: -1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            count: sites.length,
            data: sites,
        });
    } catch (error) {
        console.error(
            "Get ML site aggregates error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch site aggregates",
            error: error.message,
        });
    }
};


module.exports = {
    analyzeReport,
    classifyReport,
    assignCluster,
    getClusters,
    getClusterById,
    getSiteAggregates,
};