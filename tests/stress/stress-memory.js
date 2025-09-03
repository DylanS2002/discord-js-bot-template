const { logTestStart } = require('./stress-lifecycle');
const { analyzeMemoryLeak } = require('./stress-validators');
const operations = require('./stress-operations');
const STRESS_CONFIG = require('./stress-config');

async function runMemoryLeakTests(stress) {
    logTestStart('memory leak detection');
    
    const initialMemory = stress.getMemoryUsage();
    const { MEMORY } = STRESS_CONFIG;
    
    await stress.runSustainedTest(
        'memory_leak_detection',
        operations.memoryIntensive(MEMORY.LEAK_DETECTION.arraySize),
        MEMORY.LEAK_DETECTION.duration
    );
    
    global.gc && global.gc();
    
    const finalMemory = stress.getMemoryUsage();
    const memoryAnalysis = analyzeMemoryLeak(initialMemory, finalMemory);
    
    stress.results['memory_leak_analysis'] = memoryAnalysis;
    
    const status = memoryAnalysis.leakDetected ? 'POTENTIAL LEAK' : 'STABLE';
    const growth = memoryAnalysis.potentialLeak.toFixed(2);
    console.log(`Memory analysis: ${status} (${growth}MB growth)`);
}

module.exports = { runMemoryLeakTests };