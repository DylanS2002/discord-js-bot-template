// Bootstrap entry point
const config = require('./core/config');
const client = require('./core/client');
const shutdown = require('./core/shutdown');

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown();
});

client.login(config.discord.token).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});