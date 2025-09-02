const { insert, deleteRows } = require('./operations');
const { DATABASE_TABLES } = require('../core/constants');

function insertAuditLog(guildId, userId, action, data = {}) {
    const auditData = {
        guild_id: guildId,
        user_id: userId,
        action: action,
        data: JSON.stringify(data),
        timestamp: new Date().toISOString()
    };
    return insert(DATABASE_TABLES.AUDIT_LOGS, auditData);
}

function cleanupExpiredRateLimits() {
    const now = Date.now();
    return deleteRows(DATABASE_TABLES.RATE_LIMITS, { reset_time: `< ${now}` });
}

function insertServer(guildId, configData = {}) {
    const serverData = {
        guild_id: guildId,
        config: JSON.stringify(configData),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    return insert(DATABASE_TABLES.SERVERS, serverData);
}

function insertUser(userId, guildId, permissions = [], userData = {}) {
    const userRecord = {
        user_id: userId,
        guild_id: guildId,
        permissions: JSON.stringify(permissions),
        data: JSON.stringify(userData),
        created_at: new Date().toISOString()
    };
    return insert(DATABASE_TABLES.USERS, userRecord);
}

function insertRateLimit(identifier, count, resetTime) {
    const rateLimitData = {
        identifier: identifier,
        count: count,
        reset_time: resetTime
    };
    return insert(DATABASE_TABLES.RATE_LIMITS, rateLimitData);
}

module.exports = {
    insertAuditLog,
    cleanupExpiredRateLimits,
    insertServer,
    insertUser,
    insertRateLimit
};