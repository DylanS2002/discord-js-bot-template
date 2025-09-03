const fs = require('fs').promises;
const { PATH_OUTPUT, PATH_BASELINE, PATH_PR_BASELINE } = require('./result-paths');

const SPEED_THRESHOLD = 15;
const MEMORY_THRESHOLD = 20;
const SPEED_IMPROVEMENT_THRESHOLD = 10;
const MEMORY_IMPROVEMENT_THRESHOLD = 10;

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

        if (baselineResult.speed_ms > 0) {
            const speedChange = ((result.speed_ms - baselineResult.speed_ms) / baselineResult.speed_ms) * 100;
            if (speedChange > SPEED_THRESHOLD) {
                regressions.push({
                    component,
                    type: 'speed',
                    change: speedChange.toFixed(1),
                    current: result.speed_ms,
                    baseline: baselineResult.speed_ms
                });
            } else if (speedChange < -SPEED_IMPROVEMENT_THRESHOLD) {
                improvements.push({
                    component,
                    type: 'speed',
                    improvement: Math.abs(speedChange).toFixed(1)
                });
            }
        }

        if (baselineResult.memory_mb > 0) {
            const memoryChange = ((result.memory_mb - baselineResult.memory_mb) / baselineResult.memory_mb) * 100;
            if (memoryChange > MEMORY_THRESHOLD) {
                regressions.push({
                    component,
                    type: 'memory',
                    change: memoryChange.toFixed(1),
                    current: result.memory_mb,
                    baseline: baselineResult.memory_mb
                });
            } else if (memoryChange < -MEMORY_IMPROVEMENT_THRESHOLD) {
                improvements.push({
                    component,
                    type: 'memory',
                    improvement: Math.abs(memoryChange).toFixed(1)
                });
            }
        }
    }

    if (improvements.length > 0) {
        console.log('Performance improvements detected:');
        improvements.forEach(imp => {
            console.log(`  ✓ ${imp.component}: ${imp.type} improved by ${imp.improvement}%`);
        });
    }

    if (regressions.length > 0) {
        console.log('Performance regressions detected:');
        regressions.forEach(reg => {
            console.log(`  ✗ ${reg.component}: ${reg.type} regression +${reg.change}% (${reg.current} vs ${reg.baseline})`);
        });
        console.log(`\nFailed: ${regressions.length} regressions exceed thresholds`);
        console.log(`Speed threshold: ${SPEED_THRESHOLD}%, Memory threshold: ${MEMORY_THRESHOLD}%`);
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