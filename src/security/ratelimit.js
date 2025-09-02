const config = require('../core/config');
const { select, insert, cleanupExpiredRateLimits } = require('../data');
const { DATABASE_TABLES } = require('../core/constants');

function createIdentifier(userId, guildId, command = 'global') {
    return `${guildId}:${userId}:${command}`;
}

async function checkRateLimit(userId, guildId, command = 'global') {
    try {
        const identifier = createIdentifier(userId, guildId, command);
        const now = Date.now();
        
        const existing = await select(DATABASE_TABLES.RATE_LIMITS, { identifier });
        
        if (!existing) {
            await insert(DATABASE_TABLES.RATE_LIMITS, {
                identifier,
                count: 1,
                reset_time: now + config.security.rateLimitWindow
            });
            return { allowed: true, remaining: config.security.rateLimitMaxRequests - 1 };
        }
        
        if (now >= existing.reset_time) {
            await insert(DATABASE_TABLES.RATE_LIMITS, {
                identifier,
                count: 1,
                reset_time: now + config.security.rateLimitWindow
            });
            return { allowed: true, remaining: config.security.rateLimitMaxRequests - 1 };
        }
        
        if (existing.count >= config.security.rateLimitMaxRequests) {
            const resetIn = existing.reset_time - now;
            return { 
                allowed: false, 
                remaining: 0, 
                resetIn,
                resetTime: existing.reset_time 
            };
        }
        
        await insert(DATABASE_TABLES.RATE_LIMITS, {
            identifier,
            count: existing.count + 1,
            reset_time: existing.reset_time
        });
        
        return { 
            allowed: true, 
            remaining: config.security.rateLimitMaxRequests - (existing.count + 1) 
        };
        
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return { allowed: true, remaining: config.security.rateLimitMaxRequests };
    }
}

async function getRemainingTime(userId, guildId, command = 'global') {
    try {
        const identifier = createIdentifier(userId, guildId, command);
        const existing = await select(DATABASE_TABLES.RATE_LIMITS, { identifier });
        
        if (!existing) return 0;
        
        const now = Date.now();
        return Math.max(0, existing.reset_time - now);
        
    } catch (error) {
        console.error('Error getting remaining time:', error);
        return 0;
    }
}

async function resetUserRateLimit(userId, guildId, command = 'global') {
    try {
        const identifier = createIdentifier(userId, guildId, command);
        await insert(DATABASE_TABLES.RATE_LIMITS, {
            identifier,
            count: 0,
            reset_time: Date.now()
        });
        return true;
    } catch (error) {
        console.error('Error resetting rate limit:', error);
        return false;
    }
}

async function getUserRateLimitInfo(userId, guildId, command = 'global') {
    try {
        const identifier = createIdentifier(userId, guildId, command);
        const existing = await select(DATABASE_TABLES.RATE_LIMITS, { identifier });
        
        if (!existing) {
            return {
                count: 0,
                remaining: config.security.rateLimitMaxRequests,
                resetTime: null,
                resetIn: 0
            };
        }
        
        const now = Date.now();
        const resetIn = Math.max(0, existing.reset_time - now);
        
        return {
            count: existing.count,
            remaining: Math.max(0, config.security.rateLimitMaxRequests - existing.count),
            resetTime: existing.reset_time,
            resetIn
        };
        
    } catch (error) {
        console.error('Error getting rate limit info:', error);
        return {
            count: 0,
            remaining: config.security.rateLimitMaxRequests,
            resetTime: null,
            resetIn: 0
        };
    }
}

async function cleanupOldRateLimits() {
    try {
        const result = await cleanupExpiredRateLimits();
        return result.changes || 0;
    } catch (error) {
        console.error('Error cleaning up rate limits:', error);
        return 0;
    }
}

module.exports = {
    checkRateLimit,
    getRemainingTime,
    resetUserRateLimit,
    getUserRateLimitInfo,
    cleanupOldRateLimits
};