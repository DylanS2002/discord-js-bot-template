const { MockGenerator } = require('../helpers');
const { withDatabase, logTestStart } = require('./stress-lifecycle');
const { testRateLimitBoundaries } = require('./stress-validators');
const operations = require('./stress-operations');
const STRESS_CONFIG = require('./stress-config');

async function runSecurityStressTests(stress) {
    logTestStart('security');
    
    await withDatabase(async () => {
        const { SECURITY } = STRESS_CONFIG;
        
        await stress.runConcurrentTest(
            'rate_limit_concurrent',
            operations.rateLimitCheck,
            SECURITY.RATE_LIMIT_CONCURRENT.concurrency,
            SECURITY.RATE_LIMIT_CONCURRENT.duration
        );
        
        await stress.runConcurrentTest(
            'permission_check_concurrent',
            operations.permissionCheck,
            SECURITY.PERMISSION_CHECK_CONCURRENT.concurrency,
            SECURITY.PERMISSION_CHECK_CONCURRENT.duration
        );
        
        const testUserId = MockGenerator.generateId();
        const testGuildId = MockGenerator.generateId();
        const rateLimitResult = await testRateLimitBoundaries(
            testUserId, 
            testGuildId, 
            SECURITY.RATE_LIMIT_BOUNDARY_MAX
        );
        
        stress.results['rate_limit_boundaries'] = rateLimitResult;
        console.log(`Rate limit boundaries: ${rateLimitResult.rateLimitWorking ? 'PASS' : 'FAIL'}`);
    });
}

module.exports = { runSecurityStressTests };