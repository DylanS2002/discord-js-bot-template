const { MockGenerator } = require('../helpers');
const { insert, select } = require('../../src/data/operations');
const { checkRateLimit } = require('../../src/security/ratelimit');
const { hasPermission } = require('../../src/security/permissions');
const { getLoadedPlugins } = require('../../src/handlers/command');
const { startApiServer, stopApiServer } = require('../../src/api/server');
const { DATABASE_TABLES, DISCORD_PERMISSIONS } = require('../../src/core/constants');

const operations = {
    async dbInsert() {
        const guildId = MockGenerator.generateId();
        await insert(DATABASE_TABLES.SERVERS, {
            guild_id: guildId,
            config: JSON.stringify({ test: true }),
            created_at: new Date().toISOString()
        });
    },

    async dbSelect() {
        await select(DATABASE_TABLES.SERVERS);
    },

    async dbInsertAndSelect() {
        const guildId = MockGenerator.generateId();
        await insert(DATABASE_TABLES.SERVERS, {
            guild_id: guildId,
            config: JSON.stringify({ sustained: true })
        });
        await select(DATABASE_TABLES.SERVERS, { guild_id: guildId });
    },

    async rateLimitCheck() {
        const userId = MockGenerator.generateId();
        const guildId = MockGenerator.generateId();
        await checkRateLimit(userId, guildId, 'stress_test');
    },

    async permissionCheck() {
        const userPermissions = [DISCORD_PERMISSIONS.MANAGE_MESSAGES];
        hasPermission(userPermissions, DISCORD_PERMISSIONS.MANAGE_MESSAGES);
    },

    async pluginLoad() {
        getLoadedPlugins();
    },

    async messageParse() {
        const message = MockGenerator.generateMessage(
            MockGenerator.generateId(),
            MockGenerator.generateId()
        );
        message.content = '!test command with multiple args here';
        
        const prefix = '!';
        if (message.content.startsWith(prefix)) {
            const args = message.content.slice(prefix.length).trim().split(/\s+/);
            const command = args.shift().toLowerCase();
        }
    },

    async apiLifecycle() {
        await startApiServer();
        await stopApiServer();
    },

    memoryIntensive(arraySize) {
        return () => {
            const data = MockGenerator.generateServerData(MockGenerator.generateId());
            const largeObject = {
                ...data,
                extraData: new Array(arraySize).fill('memory_test_string')
            };
            
            setTimeout(() => {
                delete largeObject.extraData;
            }, 1);
        };
    }
};

module.exports = operations;