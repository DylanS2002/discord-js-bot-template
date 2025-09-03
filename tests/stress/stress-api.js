const { logTestStart } = require('./stress-lifecycle');
const operations = require('./stress-operations');
const STRESS_CONFIG = require('./stress-config');

async function runApiStressTests(stress) {
    logTestStart('API');
    
    process.env.API_TOKEN = 'test_stress_token';
    process.env.API_ENABLED = 'true';
    
    const { API } = STRESS_CONFIG;
    
    await stress.runConcurrentTest(
        'api_lifecycle_concurrent',
        operations.apiLifecycle,
        API.LIFECYCLE_CONCURRENT.concurrency,
        API.LIFECYCLE_CONCURRENT.duration
    );
}

module.exports = { runApiStressTests };