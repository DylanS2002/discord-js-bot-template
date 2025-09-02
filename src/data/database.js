const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const config = require('../core/config');

let db = null;

function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const dbPath = config.database.path;
        const dbDir = path.dirname(dbPath);
        
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            db.configure('busyTimeout', config.database.busyTimeout);
            runMigrations().then(resolve).catch(reject);
        });
    });
}

function runMigrations() {
    return new Promise((resolve, reject) => {
        const schemaPath = path.join(__dirname, 'schemas.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        db.exec(schema, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

function closeDatabase() {
    return new Promise((resolve) => {
        if (db) {
            db.close((err) => {
                if (err) console.error('Database close error:', err);
                db = null;
                resolve();
            });
        } else {
            resolve();
        }
    });
}

function getDatabaseConnection() {
    return db;
}

function isDatabaseReady() {
    return db !== null;
}

module.exports = {
    initializeDatabase,
    closeDatabase,
    getDatabaseConnection,
    isDatabaseReady
};