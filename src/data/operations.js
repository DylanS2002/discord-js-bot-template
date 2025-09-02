const { getDatabaseConnection } = require('./database');

function insert(table, data) {
    return new Promise((resolve, reject) => {
        const db = getDatabaseConnection();
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const keys = Object.keys(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT OR REPLACE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        
        db.run(sql, Object.values(data), function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

function select(table, where = {}) {
    return new Promise((resolve, reject) => {
        const db = getDatabaseConnection();
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const whereKeys = Object.keys(where);
        let sql = `SELECT * FROM ${table}`;
        
        if (whereKeys.length > 0) {
            const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
            sql += ` WHERE ${whereClause}`;
        }
        
        const method = whereKeys.length > 0 ? 'get' : 'all';
        const values = Object.values(where);
        
        db[method](sql, values, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

function deleteRows(table, where) {
    return new Promise((resolve, reject) => {
        const db = getDatabaseConnection();
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        
        const whereKeys = Object.keys(where);
        const whereClause = whereKeys.map(key => `${key} = ?`).join(' AND ');
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        
        db.run(sql, Object.values(where), function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function parseJsonFields(row, jsonFields) {
    if (!row) return null;
    
    const parsed = { ...row };
    jsonFields.forEach(field => {
        if (parsed[field]) {
            parsed[field] = JSON.parse(parsed[field]);
        }
    });
    return parsed;
}

function prepareJsonData(data, jsonFields) {
    const prepared = { ...data };
    jsonFields.forEach(field => {
        if (prepared[field] && typeof prepared[field] === 'object') {
            prepared[field] = JSON.stringify(prepared[field]);
        }
    });
    return prepared;
}

module.exports = {
    insert,
    select,
    deleteRows,
    parseJsonFields,
    prepareJsonData
};