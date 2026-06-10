import AuditLog from '../models/AuditLog.js';

export const logAudit = async (actor, action, entity, entityId, metadata = {}) => {
  try {
    await AuditLog.create({ actor: actor?._id || actor, action, entity, entityId, metadata });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};
