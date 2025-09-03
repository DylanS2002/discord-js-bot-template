// Environment configuration
require('dotenv').config();

function validateRequired(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function validateNumber(key, defaultValue = null) {
    const value = process.env[key];
    if (!value) {
        if (defaultValue === null) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return defaultValue;
    }
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Invalid number for environment variable: ${key}`);
    }
    return parsed;
}

function validateBoolean(key, defaultValue = false) {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
}

const config = Object.freeze({
    discord: {
        token: validateRequired('DISCORD_TOKEN'),
        clientId: validateRequired('CLIENT_ID'),
        guildId: validateRequired('GUILD_ID')
    },
    database: {
        path: process.env.DB_PATH || './data/bot.db',
        connectionTimeout: validateNumber('DB_CONNECTION_TIMEOUT', 5000),
        busyTimeout: validateNumber('DB_BUSY_TIMEOUT', 3000)
    },
    api: {
        port: validateNumber('API_PORT', 3000),
        enabled: validateBoolean('API_ENABLED', false),
        timeout: validateNumber('API_TIMEOUT', 30000)
    },
    security: {
        rateLimitWindow: validateNumber('RATE_LIMIT_WINDOW', 60000),
        rateLimitMaxRequests: validateNumber('RATE_LIMIT_MAX_REQUESTS', 10),
        commandCooldown: validateNumber('COMMAND_COOLDOWN', 1000)
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        maxFileSize: validateNumber('LOG_MAX_FILE_SIZE', 10485760),
        maxFiles: validateNumber('LOG_MAX_FILES', 5)
    }
});

module.exports = config;