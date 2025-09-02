const { MockGenerator } = require('../helpers');

async function run(benchmark) {
    const { hasPermission } = require('../../src/security/permissions');
    const { DISCORD_PERMISSIONS } = require('../../src/core/constants');
    
    await benchmark.testComponent('permission_check', async () => {
        const userPermissions = [DISCORD_PERMISSIONS.MANAGE_MESSAGES, DISCORD_PERMISSIONS.KICK_MEMBERS];
        const required = DISCORD_PERMISSIONS.MANAGE_MESSAGES;
        return hasPermission(userPermissions, required);
    }, 5000);

    await benchmark.testComponent('admin_permission_check', async () => {
        const userPermissions = [DISCORD_PERMISSIONS.ADMINISTRATOR];
        const required = DISCORD_PERMISSIONS.BAN_MEMBERS;
        return hasPermission(userPermissions, required);
    }, 3000);

    const { checkRateLimit, cleanupOldRateLimits } = require('../../src/security/ratelimit');
    const { initializeDatabase, closeDatabase } = require('../../src/data/database');
    
    await initializeDatabase();
    
    await benchmark.testComponent('rate_limit_check', async () => {
        const userId = MockGenerator.generateId();
        const guildId = MockGenerator.generateId();
        const result = await checkRateLimit(userId, guildId, 'test');
        return result.allowed;
    }, 1000);

    await benchmark.testComponent('rate_limit_cleanup', async () => {
        const cleaned = await cleanupOldRateLimits();
        return cleaned;
    }, 200);
    
    await closeDatabase();
}

module.exports = { run };