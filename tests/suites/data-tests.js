const { MockGenerator } = require('../helpers');

async function run(benchmark) {
    await benchmark.testComponent('real_db_init', async () => {
        const { initializeDatabase, closeDatabase } = require('../../src/data');
        await initializeDatabase();
        await closeDatabase();
    }, 100);

    await benchmark.testComponent('real_db_operations', async () => {
        const { initializeDatabase, insert, select, closeDatabase } = require('../../src/data');
        const { DATABASE_TABLES } = require('../../src/core/constants');
        
        await initializeDatabase();
        
        const guildId = MockGenerator.generateId();
        const serverData = {
            guild_id: guildId,
            config: JSON.stringify({ prefix: '!', enabled: true })
        };
        
        await insert(DATABASE_TABLES.SERVERS, serverData);
        const result = await select(DATABASE_TABLES.SERVERS, { guild_id: guildId });
        
        await closeDatabase();
        return result;
    }, 200);
}

module.exports = { run };