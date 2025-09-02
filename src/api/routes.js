const express = require('express');
const { queryAuditLogs, getAuditStats } = require('../handlers/audit');
const { select } = require('../data');
const { DATABASE_TABLES } = require('../core/constants');
const { getLoadedPlugins } = require('../handlers/command');
const { validateGuildId, handleAsync } = require('./middleware');

const router = express.Router();

router.get('/stats', handleAsync(async (req, res) => {
    const plugins = getLoadedPlugins();
    const stats = {
        plugins: {
            commands: plugins.commands?.length || 0,
            slash: plugins.slash?.length || 0,
            messages: plugins.messages?.length || 0,
            interactions: plugins.interactions?.length || 0
        },
        uptime: process.uptime(),
        memory: process.memoryUsage()
    };
    res.json(stats);
}));

router.get('/servers', handleAsync(async (req, res) => {
    const servers = await select(DATABASE_TABLES.SERVERS);
    const serverList = Array.isArray(servers) ? servers : (servers ? [servers] : []);
    
    const response = serverList.map(server => ({
        guild_id: server.guild_id,
        created_at: server.created_at,
        updated_at: server.updated_at
    }));
    
    res.json(response);
}));

router.get('/servers/:guildId/config', validateGuildId, handleAsync(async (req, res) => {
    const { guildId } = req.params;
    const server = await select(DATABASE_TABLES.SERVERS, { guild_id: guildId });
    
    if (!server) {
        return res.status(404).json({ error: 'Server not found' });
    }
    
    const config = JSON.parse(server.config || '{}');
    res.json(config);
}));

router.get('/servers/:guildId/audit', validateGuildId, handleAsync(async (req, res) => {
    const { guildId } = req.params;
    const { limit = 50, action, userId } = req.query;
    
    const filters = { limit: parseInt(limit) };
    if (action) filters.action = action;
    if (userId) filters.userId = userId;
    
    const logs = await queryAuditLogs(guildId, filters);
    res.json(logs);
}));

router.get('/servers/:guildId/stats', validateGuildId, handleAsync(async (req, res) => {
    const { guildId } = req.params;
    const stats = await getAuditStats(guildId);
    res.json(stats);
}));

router.put('/servers/:guildId/config', validateGuildId, handleAsync(async (req, res) => {
    const { guildId } = req.params;
    const newConfig = req.body;
    
    if (!newConfig || typeof newConfig !== 'object') {
        return res.status(400).json({ error: 'Invalid config data' });
    }
    
    const { insert } = require('../data');
    await insert(DATABASE_TABLES.SERVERS, {
        guild_id: guildId,
        config: JSON.stringify(newConfig),
        updated_at: new Date().toISOString()
    });
    
    res.json({ message: 'Config updated successfully' });
}));

module.exports = router;