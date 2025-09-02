// Message event handler
const fs = require('fs');
const path = require('path');
const { COMMAND_PREFIXES } = require('../core/constants');
const { checkRateLimit } = require('../security/ratelimit');
const { checkCommandPermission } = require('../security/permissions');
const { insertAuditLog } = require('../data/database');
const { AUDIT_ACTIONS } = require('../core/constants');

const messagePlugins = new Map();
const commandPlugins = new Map();

function loadPlugins() {
    const pluginDirs = [
        path.join(__dirname, '../plugins/messages'),
        path.join(__dirname, '../plugins/commands')
    ];
    
    pluginDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            return;
        }
        
        const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
        
        files.forEach(file => {
            try {
                const pluginPath = path.join(dir, file);
                delete require.cache[require.resolve(pluginPath)];
                const plugin = require(pluginPath);
                
                if (plugin.type === 'message') {
                    messagePlugins.set(plugin.name, plugin);
                } else if (plugin.type === 'command') {
                    commandPlugins.set(plugin.name, plugin);
                }
            } catch (error) {
                console.error(`Failed to load plugin ${file}:`, error);
            }
        });
    });
}

function parseCommand(content, guildId) {
    const prefixes = Object.values(COMMAND_PREFIXES);
    const usedPrefix = prefixes.find(prefix => content.startsWith(prefix));
    
    if (!usedPrefix) return null;
    
    const args = content.slice(usedPrefix.length).trim().split(/\s+/);
    const command = args.shift().toLowerCase();
    
    return { command, args, prefix: usedPrefix };
}

async function processMessage(message) {
    if (message.author.bot) return;
    if (!message.guild) return;
    
    for (const plugin of messagePlugins.values()) {
        try {
            if (plugin.filter && !plugin.filter(message)) continue;
            await plugin.execute(message);
        } catch (error) {
            console.error(`Message plugin ${plugin.name} error:`, error);
        }
    }
    
    const parsedCommand = parseCommand(message.content, message.guild.id);
    if (!parsedCommand) return;
    
    await processCommand(message, parsedCommand);
}

async function processCommand(message, parsedCommand) {
    const { command, args, prefix } = parsedCommand;
    const plugin = commandPlugins.get(command);
    
    if (!plugin) return;
    
    const userId = message.author.id;
    const guildId = message.guild.id;
    
    try {
        const rateLimit = await checkRateLimit(userId, guildId, command);
        if (!rateLimit.allowed) {
            await message.reply(`Rate limited. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`);
            await insertAuditLog(guildId, userId, AUDIT_ACTIONS.RATE_LIMITED, { command });
            return;
        }
        
        if (plugin.permission) {
            const hasPermission = await checkCommandPermission(userId, guildId, plugin.permission);
            if (!hasPermission) {
                await message.reply('You do not have permission to use this command.');
                await insertAuditLog(guildId, userId, AUDIT_ACTIONS.PERMISSION_DENIED, { command });
                return;
            }
        }
        
        await plugin.execute(message, args);
        await insertAuditLog(guildId, userId, AUDIT_ACTIONS.COMMAND_EXECUTED, { command, args });
        
    } catch (error) {
        console.error(`Command ${command} error:`, error);
        await insertAuditLog(guildId, userId, AUDIT_ACTIONS.ERROR_OCCURRED, { command, error: error.message });
        
        if (plugin.handleError) {
            await plugin.handleError(message, error);
        } else {
            await message.reply('An error occurred while processing your command.');
        }
    }
}

function reloadPlugins() {
    messagePlugins.clear();
    commandPlugins.clear();
    loadPlugins();
    console.log(`Loaded ${messagePlugins.size} message plugins and ${commandPlugins.size} command plugins`);
}

loadPlugins();

module.exports = {
    processMessage,
    reloadPlugins,
    getLoadedPlugins: () => ({ 
        messages: Array.from(messagePlugins.keys()), 
        commands: Array.from(commandPlugins.keys()) 
    })
};