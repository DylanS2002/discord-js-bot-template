async function testRateLimitBoundaries(userId, guildId, maxRequests) {
    const { checkRateLimit } = require('../../src/security/ratelimit');
    const { initializeDatabase, closeDatabase } = require('../../src/data');
    
    await initializeDatabase();
    
    let allowedCount = 0;
    let deniedCount = 0;
    
    for (let i = 0; i < maxRequests + 10; i++) {
        const result = await checkRateLimit(userId, guildId, 'stress_test');
        if (result.allowed) {
            allowedCount++;
        } else {
            deniedCount++;
        }
    }
    
    await closeDatabase();
    
    return {
        allowedCount,
        deniedCount,
        rateLimitWorking: deniedCount > 0 && allowedCount <= maxRequests
    };
}

function validateCriticalFailures(results) {
    return Object.entries(results)
        .filter(([name, result]) => {
            return result.errorRate > 5 || 
                   result.memoryGrowth > 20 ||
                   result.leakDetected === true ||
                   result.rateLimitWorking === false;
        });
}

function analyzeMemoryLeak(initialMemory, finalMemory) {
    const STRESS_CONFIG = require('./stress-config');
    const memoryLeak = finalMemory - initialMemory;
    
    return {
        initialMemory,
        finalMemory,
        potentialLeak: memoryLeak,
        leakDetected: memoryLeak > STRESS_CONFIG.THRESHOLDS.MEMORY_LEAK
    };
}

module.exports = {
    testRateLimitBoundaries,
    validateCriticalFailures,
    analyzeMemoryLeak
};