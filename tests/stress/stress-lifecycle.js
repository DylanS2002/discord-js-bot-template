const { initializeDatabase, closeDatabase } = require('../../src/data');

async function withDatabase(testFn) {
    await initializeDatabase();
    try {
        return await testFn();
    } finally {
        await closeDatabase();
    }
}

function logTestStart(name) {
    console.log(`Running ${name} stress tests...`);
}

module.exports = {
    withDatabase,
    logTestStart
};