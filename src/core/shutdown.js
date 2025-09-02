const client = require('./client');
const { closeDatabase } = require('../data');
const { stopApiServer } = require('../api/server');

let isShuttingDown = false;

async function shutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('Shutting down gracefully...');

    try {
        await stopApiServer();
        console.log('API server stopped');
    } catch (error) {
        console.error('Error during API server shutdown:', error);
    }

    try {
        await closeDatabase();
        console.log('Database connections closed');
    } catch (error) {
        console.error('Error during database shutdown:', error);
    }

    try {
        if (client.isReady()) {
            await client.destroy();
            console.log('Discord client disconnected');
        }
    } catch (error) {
        console.error('Error during client shutdown:', error);
    }

    console.log('Shutdown complete');
    process.exit(0);
}

module.exports = shutdown;