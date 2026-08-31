const MLResult = require("../models/mlResult.model");
const {
    createAuditLog,
} = require("../utils/auditLogger");


// ==========================================
// POST /api/ml/review
// Human agrees with or corrects ML result
// ==========================================

const reviewMLResult = async (req, res) => {
    try {
        const {
            report_id,
            model_version,
            decision,
            corrections,
            correction_notes,
        } = req.body;


                // VALIDATION
        
        if (
            !report_id ||
            !model_version ||
            !decision
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "report_id, model_version and decision are required",
            });
        }


        if (
            !["agree", "correct"].includes(
                decision
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "decision must be either agree or correct",
            });
        }


        if (
            decision === "correct" &&
            (!corrections ||
                Object.keys(corrections).length === 0)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Corrections are required when decision is correct",
            });
        }


                // FIND ML RESULT
        
        const mlResult = await MLResult.findOne({
            report_id,
            model_version,
        });

        if (!mlResult) {
            return res.status(404).json({
                success: false,
                message: "ML result not found",
            });
        }


                // PREVENT RE-REVIEW
        
        if (
            mlResult.review_status ===
                "reviewed" ||
            mlResult.review_status ===
                "corrected"
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "This ML result has already been reviewed",
            });
        }


                // AGREE
        
        if (decision === "agree") {
            mlResult.review_status =
                "reviewed";

            mlResult.reviewed_by =
                req.user.userId;

            mlResult.reviewed_at =
                new Date();

            mlResult.correction_notes =
                correction_notes || "";

            await mlResult.save();


            await createAuditLog({
                actor_id: req.user.userId,
                actor_role: req.user.role,

                action: "ml_result_reviewed",

                entity_type: "MLResult",
                entity_id:
                    mlResult._id.toString(),

                report_id:
                    mlResult.report_id,

                details:
                    correction_notes ||
                    "Human reviewer agreed with ML result",
            });


            return res.status(200).json({
                success: true,
                message:
                    "ML result reviewed and accepted",
                data: mlResult,
            });
        }


                // CORRECT
        
        mlResult.review_status =
            "corrected";

        mlResult.reviewed_by =
            req.user.userId;

        mlResult.reviewed_at =
            new Date();

        mlResult.correction_notes =
            correction_notes || "";

        // Store human corrections separately.
        mlResult.human_corrections =
            corrections;

        await mlResult.save();


        await createAuditLog({
            actor_id: req.user.userId,
            actor_role: req.user.role,

            action: "ml_result_corrected",

            entity_type: "MLResult",
            entity_id:
                mlResult._id.toString(),

            report_id:
                mlResult.report_id,

            details:
                correction_notes ||
                "Human reviewer corrected ML result",
        });


        return res.status(200).json({
            success: true,
            message:
                "ML result corrected successfully",
            data: mlResult,
        });

    } catch (error) {
        console.error(
            "ML review error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to review ML result",
            error: error.message,
        });
    }
};


module.exports = {
    reviewMLResult,
};