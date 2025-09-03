const STRESS_CONFIG = Object.freeze({
    DATABASE: {
        CONCURRENT_WRITES: { concurrency: 10, duration: 5000 },
        CONCURRENT_READS: { concurrency: 20, duration: 5000 },
        SUSTAINED_OPERATIONS: { duration: 10000 }
    },
    SECURITY: {
        RATE_LIMIT_CONCURRENT: { concurrency: 15, duration: 3000 },
        PERMISSION_CHECK_CONCURRENT: { concurrency: 50, duration: 2000 },
        RATE_LIMIT_BOUNDARY_MAX: 10
    },
    PLUGIN: {
        LOADING_CONCURRENT: { concurrency: 25, duration: 2000 },
        MESSAGE_PARSING_SUSTAINED: { duration: 8000 }
    },
    API: {
        LIFECYCLE_CONCURRENT: { concurrency: 5, duration: 3000 }
    },
    MEMORY: {
        LEAK_DETECTION: { duration: 15000, arraySize: 100 }
    },
    THRESHOLDS: {
        ERROR_RATE: 5,
        MEMORY_GROWTH: 20,
        MEMORY_LEAK: 10
    }
});

module.exports = STRESS_CONFIG;