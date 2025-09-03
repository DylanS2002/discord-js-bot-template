const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

class StressTestFramework {
    constructor() {
        this.results = {};
        this.outputPath = path.join(__dirname, 'data', 'stress-results.json');
        this.isRunning = false;
    }

    async runConcurrentTest(name, testFn, concurrency, duration) {
        console.log(`Stress testing ${name} (${concurrency} concurrent, ${duration}ms)`);
        
        const results = { operations: 0, errors: 0, memoryStart: this.getMemoryUsage(), memoryPeak: 0 };
        const responseTimes = [];
        
        this.isRunning = true;
        const workers = [];
        for (let i = 0; i < concurrency; i++) {
            workers.push(this.createWorker(testFn, duration, results, responseTimes));
        }
        
        const startTime = performance.now();
        await Promise.all(workers);
        const totalTime = performance.now() - startTime;
        
        results.opsPerSecond = (results.operations / totalTime) * 1000;
        results.errorRate = (results.errors / results.operations) * 100;
        results.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        results.memoryGrowth = this.getMemoryUsage() - results.memoryStart;
        
        this.results[name] = results;
        this.isRunning = false;
        
        console.log(`${name}: ${results.operations} ops, ${results.opsPerSecond.toFixed(2)} ops/sec`);
        return results;
    }

    async createWorker(testFn, duration, results, responseTimes) {
        const endTime = performance.now() + duration;
        
        while (performance.now() < endTime && this.isRunning) {
            const opStart = performance.now();
            
            try {
                await testFn();
                results.operations++;
                responseTimes.push(performance.now() - opStart);
            } catch (error) {
                results.errors++;
            }
        }
    }

    async runSustainedTest(name, testFn, duration) {
        console.log(`Sustained test ${name} (${duration}ms)`);
        
        const results = { operations: 0, errors: 0, memoryStart: this.getMemoryUsage() };
        const endTime = performance.now() + duration;
        
        while (performance.now() < endTime) {
            const opStart = performance.now();
            
            try {
                await testFn();
                results.operations++;
            } catch (error) {
                results.errors++;
            }
            
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        results.opsPerSecond = (results.operations / duration) * 1000;
        results.errorRate = (results.errors / results.operations) * 100;
        results.memoryGrowth = this.getMemoryUsage() - results.memoryStart;
        
        this.results[name] = results;
        console.log(`${name}: ${results.operations} ops, ${results.opsPerSecond.toFixed(2)} ops/sec`);
        return results;
    }

    getMemoryUsage() {
        return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
    }

    async saveResults() {
        await fs.mkdir(path.dirname(this.outputPath), { recursive: true });
        await fs.writeFile(this.outputPath, JSON.stringify(this.results, null, 2));
        console.log(`Stress test results saved to ${this.outputPath}`);
    }

    printSummary() {
        console.log('\n=== STRESS TEST SUMMARY ===');
        
        Object.entries(this.results).forEach(([name, result]) => {
            console.log(`\n${name}:`);
            console.log(`  Operations: ${result.operations}`);
            console.log(`  Ops/sec: ${result.opsPerSecond?.toFixed(2) || 'N/A'}`);
            console.log(`  Error rate: ${result.errorRate?.toFixed(2) || 0}%`);
            console.log(`  Memory growth: ${result.memoryGrowth?.toFixed(2) || 0}MB`);
        });
    }
}

module.exports = StressTestFramework;