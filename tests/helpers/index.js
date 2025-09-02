class MockGenerator {
    static generateId() {
        return Math.random().toString().slice(2, 20);
    }

    static generateMessage(guildId, userId) {
        return {
            id: this.generateId(),
            content: `Test message ${Math.floor(Math.random() * 1000)}`,
            author: { id: userId, username: `user${userId.slice(-4)}`, bot: false },
            guild: { id: guildId },
            channel: { id: this.generateId() },
            createdTimestamp: Date.now()
        };
    }

    static generateInteraction(guildId, userId) {
        return {
            id: this.generateId(),
            user: { id: userId, username: `user${userId.slice(-4)}` },
            guild: { id: guildId },
            channel: { id: this.generateId() },
            commandName: 'test',
            options: { data: [] },
            createdTimestamp: Date.now()
        };
    }

    static generateServerData(guildId) {
        return {
            guild_id: guildId,
            config: JSON.stringify({
                prefix: '!',
                enabled: true,
                permissions: ['manage_messages']
            }),
            created_at: new Date().toISOString()
        };
    }
}

class MockDatabase {
    constructor() {
        this.servers = new Map();
        this.users = new Map();
        this.audit_logs = [];
        this.rate_limits = new Map();
    }

    async insert(table, data) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2));
        
        switch(table) {
            case 'servers':
                this.servers.set(data.guild_id, data);
                break;
            case 'users':
                this.users.set(`${data.guild_id}_${data.user_id}`, data);
                break;
            case 'audit_logs':
                this.audit_logs.push({...data, id: Date.now()});
                break;
            case 'rate_limits':
                this.rate_limits.set(data.identifier, data);
                break;
        }
        return true;
    }

    async select(table, where = {}) {
        await new Promise(resolve => setTimeout(resolve, Math.random()));
        
        switch(table) {
            case 'servers':
                return where.guild_id ? this.servers.get(where.guild_id) : Array.from(this.servers.values());
            case 'users':
                return where.guild_id && where.user_id ? 
                    this.users.get(`${where.guild_id}_${where.user_id}`) : 
                    Array.from(this.users.values());
            case 'audit_logs':
                return this.audit_logs.filter(log => !where.guild_id || log.guild_id === where.guild_id);
            case 'rate_limits':
                return where.identifier ? this.rate_limits.get(where.identifier) : Array.from(this.rate_limits.values());
        }
        return null;
    }

    cleanup() {
        this.servers.clear();
        this.users.clear();
        this.audit_logs = [];
        this.rate_limits.clear();
    }
}

function withCleanDatabase(testFn) {
    return async function() {
        const mockDb = new MockDatabase();
        try {
            await testFn(mockDb);
        } finally {
            mockDb.cleanup();
        }
    };
}

function assertSpeedUnder(actualMs, maxMs, componentName) {
    if (actualMs > maxMs) {
        throw new Error(`${componentName} too slow: ${actualMs}ms > ${maxMs}ms`);
    }
}

module.exports = { MockGenerator, MockDatabase, withCleanDatabase, assertSpeedUnder };