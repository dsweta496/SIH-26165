const AuditLog = require("../models/auditLog.model");

const createAuditLog = async ({
    actor_id,
    actor_role,
    action,
    entity_type,
    entity_id,
    report_id = null,
    proposal_id = null,
    solution_id = null,
    details = "",
}) => {
    try {
        return await AuditLog.create({
            audit_id: `AUDIT-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase()}`,

            actor_id,
            actor_role,
            action,
            entity_type,
            entity_id,
            report_id,
            proposal_id,
            solution_id,
            details,
            created_at: new Date(),
        });
    } catch (error) {
        console.error(
            "Audit log creation error:",
            error.message
        );

        // Audit logging should never break the
        // actual business operation.
        return null;
    }
};

module.exports = {
    createAuditLog,
};