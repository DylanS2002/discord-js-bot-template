const StressTestFramework = require('./stress');
const { runDatabaseStressTests } = require('./stress/stress-database');
const { runSecurityStressTests } = require('./stress/stress-security');
const { runPluginStressTests } = require('./stress/stress-plugins');
const { runApiStressTests } = require('./stress/stress-api');
const { runMemoryLeakTests } = require('./stress/stress-memory');
const { validateCriticalFailures } = require('./stress/stress-validators');

async function runAllStressTests() {
    console.log('Starting stress testing suite\n');
    
    const stress = new StressTestFramework();
    
    try {
        await runDatabaseStressTests(stress);
        await runSecurityStressTests(stress);
        await runPluginStressTests(stress);
        await runApiStressTests(stress);
        await runMemoryLeakTests(stress);
        
        stress.printSummary();
        await stress.saveResults();
        
        const criticalFailures = validateCriticalFailures(stress.results);
        
        if (criticalFailures.length > 0) {
            console.log('\n⚠️  CRITICAL ISSUES DETECTED:');
            criticalFailures.forEach(([name, result]) => {
                console.log(`  ${name}: ${JSON.stringify(result, null, 2)}`);
            });
            process.exit(1);
        } else {
            console.log('\n✅ All stress tests passed');
        }
        
    } catch (error) {
        console.error('Stress testing failed:', error);
        process.exit(1);
    }
    
    process.exit(0);
}

if (require.main === module) {
    runAllStressTests().catch(console.error);
}

module.exports = { runAllStressTests };