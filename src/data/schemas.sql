-- Database table schemas
-- servers table: guild configuration storage
CREATE TABLE IF NOT EXISTS servers (
    guild_id TEXT PRIMARY KEY,
    config TEXT NOT NULL DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- users table: per-server user data and permissions
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    permissions TEXT DEFAULT '[]',
    data TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, guild_id),
    FOREIGN KEY (guild_id) REFERENCES servers(guild_id) ON DELETE CASCADE
);

-- audit_logs table: system and user action tracking
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT,
    action TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    data TEXT DEFAULT '{}',
    FOREIGN KEY (guild_id) REFERENCES servers(guild_id) ON DELETE CASCADE
);

-- rate_limits table: command rate limiting storage
CREATE TABLE IF NOT EXISTS rate_limits (
    identifier TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    reset_time INTEGER NOT NULL
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_servers_guild_id ON servers(guild_id);
CREATE INDEX IF NOT EXISTS idx_users_guild_user ON users(guild_id, user_id);
CREATE INDEX IF NOT EXISTS idx_audit_guild_timestamp ON audit_logs(guild_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_user_timestamp ON audit_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON rate_limits(reset_time);

-- Cleanup trigger for updated_at on servers
CREATE TRIGGER IF NOT EXISTS servers_updated_at 
AFTER UPDATE ON servers
BEGIN
    UPDATE servers SET updated_at = CURRENT_TIMESTAMP WHERE guild_id = NEW.guild_id;
END;