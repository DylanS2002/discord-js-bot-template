const { select, insertAuditLog } = require('../data');
const { DATABASE_TABLES, LOG_LEVELS, AUDIT_ACTIONS } = require('../core/constants');
const logger = require('../utils/logger');

async function logEvent(level, action, guildId, userId, data = {}) {
    const message = `${action}: ${guildId}${userId ? `:${userId}` : ''}`;
    
    if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.DEBUG) {
        console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
    
    await logger.write(level, message, data);
    
    if (guildId && level !== LOG_LEVELS.DEBUG) {
        try {
            await insertAuditLog(guildId, userId, action, data);
        } catch (error) {
            console.error('Failed to insert audit log:', error);
        }
    }
}

async function logCommandExecution(guildId, userId, command, args, success = true) {
    const action = success ? AUDIT_ACTIONS.COMMAND_EXECUTED : AUDIT_ACTIONS.ERROR_OCCURRED;
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.ERROR;
    await logEvent(level, action, guildId, userId, { command, args });
}

async function logPermissionDenied(guildId, userId, command, requiredPermission) {
    await logEvent(LOG_LEVELS.WARN, AUDIT_ACTIONS.PERMISSION_DENIED, guildId, userId, {
        command, requiredPermission
    });
}

async function logRateLimit(guildId, userId, command) {
    await logEvent(LOG_LEVELS.WARN, AUDIT_ACTIONS.RATE_LIMITED, guildId, userId, { command });
}

async function logError(error, context = {}) {
    await logEvent(LOG_LEVELS.ERROR, AUDIT_ACTIONS.ERROR_OCCURRED, context.guildId, context.userId, {
        error: error.message,
        stack: error.stack,
        context
    });
}

async function logUserJoin(guildId, userId) {
    await logEvent(LOG_LEVELS.INFO, AUDIT_ACTIONS.USER_JOINED, guildId, userId);
}

async function logUserLeave(guildId, userId) {
    await logEvent(LOG_LEVELS.INFO, AUDIT_ACTIONS.USER_LEFT, guildId, userId);
}

async function logServerAdd(guildId) {
    await logEvent(LOG_LEVELS.INFO, AUDIT_ACTIONS.SERVER_ADDED, guildId, null);
}

async function logServerRemove(guildId) {
    await logEvent(LOG_LEVELS.INFO, AUDIT_ACTIONS.SERVER_REMOVED, guildId, null);
}

async function queryAuditLogs(guildId, filters = {}) {
    try {
        const whereClause = { guild_id: guildId };
        
        if (filters.userId) whereClause.user_id = filters.userId;
        if (filters.action) whereClause.action = filters.action;
        
        const logs = await select(DATABASE_TABLES.AUDIT_LOGS, whereClause);
        
        if (Array.isArray(logs)) {
            return logs.slice(0, filters.limit || 100);
        }
        
        return logs ? [logs] : [];
        
    } catch (error) {
        console.error('Failed to query audit logs:', error);
        return [];
    }
}

async function getAuditStats(guildId) {
    try {
        const logs = await select(DATABASE_TABLES.AUDIT_LOGS, { guild_id: guildId });
        const logArray = Array.isArray(logs) ? logs : (logs ? [logs] : []);
        
        const stats = {
            totalEvents: logArray.length,
            commandsExecuted: logArray.filter(log => log.action === AUDIT_ACTIONS.COMMAND_EXECUTED).length,
            errorsOccurred: logArray.filter(log => log.action === AUDIT_ACTIONS.ERROR_OCCURRED).length,
            permissionsDenied: logArray.filter(log => log.action === AUDIT_ACTIONS.PERMISSION_DENIED).length,
            rateLimited: logArray.filter(log => log.action === AUDIT_ACTIONS.RATE_LIMITED).length
        };
        
        return stats;
    } catch (error) {
        console.error('Failed to get audit stats:', error);
        return { totalEvents: 0, commandsExecuted: 0, errorsOccurred: 0, permissionsDenied: 0, rateLimited: 0 };
    }
}

module.exports = {
    logCommandExecution,
    logPermissionDenied,
    logRateLimit,
    logError,
    logUserJoin,
    logUserLeave,
    logServerAdd,
    logServerRemove,
    queryAuditLogs,
    getAuditStats
};