// Slash command handler
const fs = require('fs');
const path = require('path');
const { checkRateLimit } = require('../security/ratelimit');
const { checkCommandPermission } = require('../security/permissions');
const { insertAuditLog } = require('../data/database');
const { AUDIT_ACTIONS } = require('../core/constants');

const slashPlugins = new Map();

function loadSlashPlugins() {
    const pluginDir = path.join(__dirname, '../plugins/slash');
    
    if (!fs.existsSync(pluginDir)) {
        fs.mkdirSync(pluginDir, { recursive: true });
        return;
    }
    
    const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));
    
    files.forEach(file => {
        try {
            const pluginPath = path.join(pluginDir, file);
            delete require.cache[require.resolve(pluginPath)];
            const plugin = require(pluginPath);
            
            if (plugin.type === 'slash' && plugin.name) {
                slashPlugins.set(plugin.name, plugin);
            }
        } catch (error) {
            console.error(`Failed to load slash plugin ${file}:`, error);
        }
    });
}

async function processSlashCommand(interaction) {
    if (!interaction.isChatInputCommand()) return;
    
    const commandName = interaction.commandName;
    const plugin = slashPlugins.get(commandName);
    
    if (!plugin) {
        await interaction.reply({ content: 'Unknown command.', ephemeral: true });
        return;
    }
    
    const userId = interaction.user.id;
    const guildId = interaction.guild?.id;
    
    try {
        if (guildId) {
            const rateLimit = await checkRateLimit(userId, guildId, commandName);
            if (!rateLimit.allowed) {
                await interaction.reply({ 
                    content: `Rate limited. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
                    ephemeral: true 
                });
                await insertAuditLog(guildId, userId, AUDIT_ACTIONS.RATE_LIMITED, { command: commandName });
                return;
            }
            
            if (plugin.permission) {
                const hasPermission = await checkCommandPermission(userId, guildId, plugin.permission);
                if (!hasPermission) {
                    await interaction.reply({ 
                        content: 'You do not have permission to use this command.',
                        ephemeral: true 
                    });
                    await insertAuditLog(guildId, userId, AUDIT_ACTIONS.PERMISSION_DENIED, { command: commandName });
                    return;
                }
            }
        }
        
        await plugin.execute(interaction);
        
        if (guildId) {
            await insertAuditLog(guildId, userId, AUDIT_ACTIONS.COMMAND_EXECUTED, { 
                command: commandName,
                options: interaction.options.data 
            });
        }
        
    } catch (error) {
        console.error(`Slash command ${commandName} error:`, error);
        
        if (guildId) {
            await insertAuditLog(guildId, userId, AUDIT_ACTIONS.ERROR_OCCURRED, { 
                command: commandName, 
                error: error.message 
            });
        }
        
        if (plugin.handleError) {
            await plugin.handleError(interaction, error);
        } else {
            const content = 'An error occurred while processing your command.';
            
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content, ephemeral: true });
            } else {
                await interaction.reply({ content, ephemeral: true });
            }
        }
    }
}

function getSlashCommandData() {
    return Array.from(slashPlugins.values())
        .filter(plugin => plugin.data)
        .map(plugin => plugin.data);
}

function reloadSlashPlugins() {
    slashPlugins.clear();
    loadSlashPlugins();
    console.log(`Loaded ${slashPlugins.size} slash command plugins`);
}

loadSlashPlugins();

module.exports = {
    processSlashCommand,
    getSlashCommandData,
    reloadSlashPlugins,
    getLoadedPlugins: () => Array.from(slashPlugins.keys())
};