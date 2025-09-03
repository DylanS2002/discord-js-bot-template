const { logTestStart } = require('./stress-lifecycle');
const operations = require('./stress-operations');
const STRESS_CONFIG = require('./stress-config');

async function runPluginStressTests(stress) {
    logTestStart('plugin system');
    
    const { PLUGIN } = STRESS_CONFIG;
    
    await stress.runConcurrentTest(
        'plugin_loading_concurrent',
        operations.pluginLoad,
        PLUGIN.LOADING_CONCURRENT.concurrency,
        PLUGIN.LOADING_CONCURRENT.duration
    );
    
    await stress.runSustainedTest(
        'message_parsing_sustained',
        operations.messageParse,
        PLUGIN.MESSAGE_PARSING_SUSTAINED.duration
    );
}

module.exports = { runPluginStressTests };