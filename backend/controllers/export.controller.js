const ProblemReport = require("../models/problemReport.model");
const MLResult = require("../models/mlResult.model");


// CSV ESCAPE HELPER

const escapeCSV = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    if (Array.isArray(value)) {
        value = value.join("; ");
    }

    value = String(value);

    // Escape quotes by doubling them
    value = value.replace(/"/g, '""');

    return `"${value}"`;
};


// EXPORT REPORT + ML DATASET

const exportReportsCSV = async (req, res) => {
    try {
        const reports = await ProblemReport.find({})
            .sort({
                createdAt: -1,
            })
            .lean();

        const mlResults = await MLResult.find({})
            .sort({
                createdAt: -1,
            })
            .lean();
        
        // CSV COLUMNS
        

        const headers = [
            "report_id",
            "source_type",
            "source_reference",
            "report_date",
            "site",
            "activity",
            "location",
            "equipment",
            "report_text",
            "language_style",
            "hazard",
            "energy_source",
            "exposure",
            "unsafe_act_condition",
            "barrier_or_control",
            "barrier_failure_mode",
            "barrier_function",
            "potential_consequence",
            "actual_outcome",
            "sif_potential",
            "sif_level",
            "lsr_tags",
            "evidence_phrases",

            // ML metadata
            "model_name",
            "model_version",
            "sif_confidence",

            // Temporal intelligence
            "cluster_id",
            "recurrence_count",
            "trend",
            "barrier_health",

            // SBRI
            "sbri_score",
            "sbri_severity",
            "sbri_exposure",
            "sbri_barrier_criticality",
            "sbri_recurrence",
            "sbri_trend",

            // Human review
            "ml_review_status",
            "ml_reviewed_by",
            "ml_reviewed_at",
            "correction_notes",
        ];


        const rows = [headers];


        
        // BUILD ROWS
        

        for (const report of reports) {

            // Find the latest ML result for this report
            const matchingResults =
                mlResults.filter(
                    (result) =>
                        result.report_id ===
                        report.report_id
                );

            const latestML =
                matchingResults.length > 0
                    ? matchingResults[0]
                    : null;


            rows.push([
                report.report_id,
                report.source_type,
                report.source_reference,
                report.report_date,
                report.site,
                report.activity,
                report.location,
                report.equipment,
                report.report_text,
                report.language_style,
                report.hazard,
                report.energy_source,
                report.exposure,
                report.unsafe_act_condition,
                report.barrier_or_control,
                report.barrier_failure_mode,
                report.barrier_function,
                report.potential_consequence,
                report.actual_outcome,
                report.sif_potential,
                report.sif_level,
                report.lsr_tags,
                report.evidence_phrases,

                latestML?.model_name,
                latestML?.model_version,
                latestML?.sif_confidence,

                latestML?.cluster_id,
                latestML?.recurrence_count,
                latestML?.trend,
                latestML?.barrier_health,

                latestML?.sbri_score,
                latestML?.sbri_drivers?.severity,
                latestML?.sbri_drivers?.exposure,
                latestML?.sbri_drivers?.barrier_criticality,
                latestML?.sbri_drivers?.recurrence,
                latestML?.sbri_drivers?.trend,

                latestML?.review_status,
                latestML?.reviewed_by,
                latestML?.reviewed_at,
                latestML?.correction_notes,
            ].map(escapeCSV));
        }


        
        // CREATE CSV
        

        const csv = rows
            .map((row) => row.join(","))
            .join("\r\n");


        
        // RESPONSE
        

        const filename =
            `sih26165-report-export-${Date.now()}.csv`;

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        return res.status(200).send(csv);

    } catch (error) {
        console.error(
            "CSV export error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Failed to export CSV",
            error: error.message,
        });
    }
};

// EXPORT RESOLVED CASE HISTORY CSV

const exportResolvedCasesCSV = async (req, res) => {
    try {
        const reports = await ProblemReport.find({
            case_status: "resolved",
        })
            .sort({
                resolved_at: -1,
                createdAt: -1,
            })
            .lean();

        const headers = [
            "report_id",
            "site",
            "activity",
            "location",
            "equipment",
            "sif_potential",
            "sif_level",
            "assigned_team",
            "case_status",
            "resolved_at",
        ];

        const rows = [headers];

        for (const report of reports) {

            rows.push([
                report.report_id,
                report.site,
                report.activity,
                report.location,
                report.equipment,
                report.sif_potential,
                report.sif_level,
                report.assigned_team,
                report.case_status,
                report.resolved_at,
            ].map(escapeCSV));
        }

        const csv = rows
            .map((row) => row.join(","))
            .join("\r\n");

        const filename =
            `sih26165-resolved-case-history-${Date.now()}.csv`;

        res.setHeader(
            "Content-Type",
            "text/csv; charset=utf-8"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );

        return res.status(200).send(csv);

    } catch (error) {

        console.error(
            "Resolved case CSV export error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to export resolved case history",
            error: error.message,
        });
    }
};

module.exports = {
    exportReportsCSV,
    exportResolvedCasesCSV
};