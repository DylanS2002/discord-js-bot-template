const { withDatabase, logTestStart } = require('./stress-lifecycle');
const operations = require('./stress-operations');
const STRESS_CONFIG = require('./stress-config');

async function runDatabaseStressTests(stress) {
    logTestStart('database');
    
    await withDatabase(async () => {
        const { DATABASE } = STRESS_CONFIG;
        
        await stress.runConcurrentTest(
            'db_concurrent_writes', 
            operations.dbInsert,
            DATABASE.CONCURRENT_WRITES.concurrency,
            DATABASE.CONCURRENT_WRITES.duration
        );
        
        await stress.runConcurrentTest(
            'db_concurrent_reads',
            operations.dbSelect,
            DATABASE.CONCURRENT_READS.concurrency,
            DATABASE.CONCURRENT_READS.duration
        );
        
        await stress.runSustainedTest(
            'db_sustained_operations',
            operations.dbInsertAndSelect,
            DATABASE.SUSTAINED_OPERATIONS.duration
        );
    });
}

module.exports = { runDatabaseStressTests };