const BenchmarkFramework = require('./benchmark.js');
const coreTests = require('./suites/core-tests');
const dataTests = require('./suites/data-tests');
const securityTests = require('./suites/security-tests');
const handlerTests = require('./suites/handler-tests');

async function runAllBenchmarks() {
    const benchmark = new BenchmarkFramework();
    await benchmark.loadBaselines();

    console.log('Starting benchmarks\n');

    await coreTests.run(benchmark);
    await dataTests.run(benchmark);
    await securityTests.run(benchmark);
    await handlerTests.run(benchmark);

    benchmark.printSummary();
    await benchmark.saveResults();

    if (process.argv.includes('--update-baseline')) {
        await benchmark.updateBaseline();
    }

    process.exit(0);
}

if (require.main === module) {
    runAllBenchmarks().catch(console.error);
}

module.exports = { runAllBenchmarks };