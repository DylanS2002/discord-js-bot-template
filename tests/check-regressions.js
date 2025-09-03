const fs = require('fs').promises;
const { PATH_OUTPUT, PATH_BASELINE, PATH_PR_BASELINE } = require('./result-paths');

const SPEED_REGRESSION_THRESHOLD_MS = 5;
const MEMORY_REGRESSION_THRESHOLD_MB = 10;
const SPEED_IMPROVEMENT_THRESHOLD_MS = 2;
const MEMORY_IMPROVEMENT_THRESHOLD_MB = 5;

const SKIP_COMPONENTS = ['audit_logging', 'docs_generation'];

async function checkRegressions() {
    const resultsPath = PATH_OUTPUT;
    const isCI = process.env.CI === 'true';
    const baselinePath = isCI ? PATH_PR_BASELINE : PATH_BASELINE;

    let results, baseline;

    try {
        results = JSON.parse(await fs.readFile(resultsPath, 'utf8'));
    } catch (error) {
        console.error('Failed to read results:', error.message);
        process.exit(1);
    }

    try {
        baseline = JSON.parse(await fs.readFile(baselinePath, 'utf8'));
    } catch {
        if (isCI && process.env.GITHUB_REF === 'refs/heads/main') {
            console.log('Main branch: No baseline exists, will be created by workflow');
            process.exit(0);
        }
        if (isCI && process.env.GITHUB_REF !== 'refs/heads/main') {
            console.error('No baseline found for PR comparison. Run benchmarks on main branch first.');
            process.exit(1);
        }
        await fs.writeFile(baselinePath, JSON.stringify(results, null, 2));
        console.log(`Baseline established at ${baselinePath}`);
        process.exit(0);
    }

    const regressions = [];
    const improvements = [];

    for (const [component, result] of Object.entries(results)) {
        if (!baseline[component] || result.status !== 'pass') continue;
        if (SKIP_COMPONENTS.includes(component)) continue;

        const baselineResult = baseline[component];

        const speedChange = result.speed_ms - baselineResult.speed_ms;
        if (speedChange > SPEED_REGRESSION_THRESHOLD_MS) {
            regressions.push({
                component,
                type: 'speed',
                change: speedChange.toFixed(2),
                current: result.speed_ms,
                baseline: baselineResult.speed_ms
            });
        } else if (speedChange < -SPEED_IMPROVEMENT_THRESHOLD_MS) {
            improvements.push({
                component,
                type: 'speed',
                improvement: Math.abs(speedChange).toFixed(2)
            });
        }

        const memoryChange = result.memory_mb - baselineResult.memory_mb;
        if (memoryChange > MEMORY_REGRESSION_THRESHOLD_MB) {
            regressions.push({
                component,
                type: 'memory',
                change: memoryChange.toFixed(2),
                current: result.memory_mb,
                baseline: baselineResult.memory_mb
            });
        } else if (memoryChange < -MEMORY_IMPROVEMENT_THRESHOLD_MB) {
            improvements.push({
                component,
                type: 'memory',
                improvement: Math.abs(memoryChange).toFixed(2)
            });
        }
    }

    if (improvements.length > 0) {
        console.log('Performance improvements detected:');
        improvements.forEach(imp => {
            const unit = imp.type === 'speed' ? 'ms' : 'MB';
            console.log(`  ✓ ${imp.component}: ${imp.type} improved by ${imp.improvement}${unit}`);
        });
    }

    if (regressions.length > 0) {
        console.log('Performance regressions detected:');
        regressions.forEach(reg => {
            const unit = reg.type === 'speed' ? 'ms' : 'MB';
            console.log(`  ✗ ${reg.component}: ${reg.type} regression +${reg.change}${unit} (${reg.current} vs ${reg.baseline})`);
        });
        console.log(`\nFailed: ${regressions.length} regressions exceed thresholds`);
        console.log(`Speed threshold: ${SPEED_REGRESSION_THRESHOLD_MS}ms, Memory threshold: ${MEMORY_REGRESSION_THRESHOLD_MB}MB`);
        process.exit(1);
    }

    if (improvements.length > 0) {
        console.log('Updating baseline with improvements...');
        await fs.writeFile(baselinePath, JSON.stringify(results, null, 2));
    }

    console.log('All performance checks passed');
    process.exit(0);
}

if (require.main === module) {
    checkRegressions().catch(console.error);
}

module.exports = { checkRegressions };