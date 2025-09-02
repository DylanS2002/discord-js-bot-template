async function run(benchmark) {
    process.env.DISCORD_TOKEN = 'mock_token';
    process.env.CLIENT_ID = '12345';
    
    await benchmark.testComponent('config_loading', async () => {
        delete require.cache[require.resolve('../../src/core/config')];
        const config = require('../../src/core/config');
        return config;
    }, 5000);

    await benchmark.testComponent('constants_access', async () => {
        const constants = require('../../src/core/constants');
        const permission = constants.DISCORD_PERMISSIONS.MANAGE_MESSAGES;
        const table = constants.DATABASE_TABLES.SERVERS;
        return { permission, table };
    }, 10000);

    await benchmark.testComponent('client_initialization', async () => {
        delete require.cache[require.resolve('../../src/core/client')];
        const client = require('../../src/core/client');
        return client.options;
    }, 1000);

    await benchmark.testComponent('shutdown_preparation', async () => {
        const shutdown = require('../../src/core/shutdown');
        return typeof shutdown === 'function';
    }, 2000);
}

module.exports = { run };