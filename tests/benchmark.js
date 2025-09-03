const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');
const { PATH_BASELINE, PATH_OUTPUT } = require('./result-paths');

class BenchmarkFramework {
    constructor(outputPath = PATH_OUTPUT) {
        this.results = {};
        this.baselines = {};
        this.outputPath = outputPath;
        this.baselinePath = PATH_BASELINE;
    }

    async loadBaselines() {
        try {
            const data = await fs.readFile(this.baselinePath, 'utf8');
            this.baselines = JSON.parse(data);
        } catch {
            this.baselines = {};
        }
    }

    async measureTime(fn, iterations = 1000) {
        const measurements = [];
        const sampleCount = 10;
        
        for (let i = 0; i < sampleCount; i++) {
            const start = performance.now();
            for (let j = 0; j < iterations; j++) {
                await fn();
            }
            measurements.push((performance.now() - start) / iterations);
        }
        
        measurements.sort((a, b) => a - b);
        return measurements[Math.floor(measurements.length / 2)];
    }

    measureMemory() {
        if (global.gc) global.gc();
        const usage = process.memoryUsage();
        return Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100;
    }

    async testComponent(name, testFn, iterations = 1000) {
        if (['audit_logging', 'docs_generation'].includes(name)) {
            iterations = 50;
        }
        console.log(`Testing ${name}...`);
        
        const memoryBefore = this.measureMemory();
        let status = 'pass';
        let totalTime = 0;
        
        try {
            totalTime = await this.measureTime(testFn, iterations);
        } catch (err) {
            status = 'fail';
            console.log(`${name}: FAIL - ${err.message}`);
        }
        
        const memoryAfter = this.measureMemory();
        
        this.results[name] = {
            speed_ms: Math.round(totalTime * 100) / 100,
            memory_mb: memoryAfter,
            memory_delta_mb: Math.round((memoryAfter - memoryBefore) * 100) / 100,
            status: status,
            timestamp: new Date().toISOString()
        };
        
        this.checkRegression(name);
        console.log(`${name}: ${status} (${this.results[name].speed_ms}ms)`);
    }

    checkRegression(componentName) {
        const baseline = this.baselines[componentName];
        const current = this.results[componentName];
        
        if (!baseline) return;
        
        const speedDifference = current.speed_ms - baseline.speed_ms;
        const memoryDifference = current.memory_mb - baseline.memory_mb;
        
        current.baseline_comparison = {
            speed_change_ms: Math.round(speedDifference * 100) / 100,
            memory_change_mb: Math.round(memoryDifference * 100) / 100,
            baseline_speed_ms: baseline.speed_ms,
            baseline_memory_mb: baseline.memory_mb
        };
        
        if (speedDifference > 5) {
            console.warn(`⚠️ ${componentName}: Speed regression (+${speedDifference.toFixed(2)}ms)`);
        }
        if (memoryDifference > 10) {
            console.warn(`⚠️ ${componentName}: Memory regression (+${memoryDifference.toFixed(2)}MB)`);
        }
    }

    async saveResults() {
        let existingResults = {};
        try {
            const data = await fs.readFile(this.outputPath, 'utf8');
            existingResults = JSON.parse(data);
        } catch {
            // File doesn't exist or invalid JSON, start fresh
        }

        const mergedResults = { ...existingResults, ...this.results };
        
        await fs.mkdir(path.dirname(this.outputPath), { recursive: true });
        await fs.writeFile(this.outputPath, JSON.stringify(mergedResults, null, 2));
        console.log(`Results saved to ${this.outputPath}`);
    }

    async updateBaseline() {
        await fs.mkdir(path.dirname(this.baselinePath), { recursive: true });
        await fs.writeFile(this.baselinePath, JSON.stringify(this.results, null, 2));
        console.log('Baseline updated');
    }

    printSummary() {
        const components = Object.keys(this.results);
        const passed = components.filter(name => this.results[name].status === 'pass').length;
        const failed = components.length - passed;
        
        console.log(`\nTested: ${components.length}, Passed: ${passed}, Failed: ${failed}`);
        
        components.forEach(name => {
            const result = this.results[name];
            if (result.status === 'pass') {
                console.log(`${name}: ${result.speed_ms}ms, ${result.memory_per_op_mb || 0}MB`);
            }
        });
    }
}

module.exports = BenchmarkFramework;