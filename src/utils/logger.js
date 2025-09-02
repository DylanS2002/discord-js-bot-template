// Centralized logging
const fs = require('fs').promises;
const path = require('path');
const config = require('../core/config');

let logFile = null;
let logRotationSize = 0;

function getLogFilePath() {
    const date = new Date().toISOString().split('T')[0];
    return path.join('./logs', `audit-${date}.log`);
}

async function initializeLogging() {
    const logDir = path.dirname(getLogFilePath());
    return fs.mkdir(logDir, { recursive: true }).catch(() => {});
}

async function write(level, message, data = {}) {
    try {
        const timestamp = new Date().toISOString();
        const logEntry = JSON.stringify({
            timestamp,
            level,
            message,
            data
        }) + '\n';
        
        const currentLogFile = getLogFilePath();
        
        if (logFile !== currentLogFile) {
            logFile = currentLogFile;
            logRotationSize = 0;
        }
        
        await fs.appendFile(logFile, logEntry);
        logRotationSize += logEntry.length;
        
        if (logRotationSize > config.logging.maxFileSize) {
            await rotateLogFile();
        }
        
    } catch (error) {
        console.error('Failed to write to log:', error);
    }
}

async function rotateLogFile() {
    try {
        const timestamp = Date.now();
        const rotatedFile = logFile.replace('.log', `-${timestamp}.log`);
        await fs.rename(logFile, rotatedFile);
        logRotationSize = 0;
        
        await cleanupOldLogs();
        
    } catch (error) {
        console.error('Log rotation failed:', error);
    }
}

async function cleanupOldLogs() {
    try {
        const logDir = path.dirname(logFile);
        const files = await fs.readdir(logDir);
        const logFiles = files.filter(file => file.startsWith('audit-') && file.endsWith('.log'));
        
        if (logFiles.length > config.logging.maxFiles) {
            const sortedFiles = logFiles.sort();
            const filesToDelete = sortedFiles.slice(0, logFiles.length - config.logging.maxFiles);
            
            for (const file of filesToDelete) {
                await fs.unlink(path.join(logDir, file));
            }
        }
    } catch (error) {
        console.error('Log cleanup failed:', error);
    }
}

initializeLogging();

module.exports = {
    write,
    rotateLogFile,
    cleanupOldLogs
};