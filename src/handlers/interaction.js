const fs = require('fs');
const path = require('path');
const { checkRateLimit } = require('../security/ratelimit');
const { insertAuditLog } = require('../data');
const { AUDIT_ACTIONS, EPHEMERAL } = require('../core/constants');

const interactionPlugins = new Map();

function loadInteractionPlugins() {
    const pluginDir = path.join(__dirname, '../plugins/interactions');
    
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
            
            if (plugin.type === 'interaction' && plugin.name) {
                interactionPlugins.set(plugin.name, plugin);
            }
        } catch (error) {
            console.error(`Failed to load interaction plugin ${file}:`, error);
        }
    });
}

async function processInteraction(interaction) {
    if (interaction.isChatInputCommand()) return;
    
    const userId = interaction.user.id;
    const guildId = interaction.guild?.id;
    
    for (const plugin of interactionPlugins.values()) {
        try {
            if (plugin.filter && !plugin.filter(interaction)) continue;
            
            if (guildId) {
                const rateLimit = await checkRateLimit(userId, guildId, `interaction_${plugin.name}`);
                if (!rateLimit.allowed) {
                    await interaction.reply({ 
                        content: `Rate limited. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
                        flags: EPHEMERAL
                    });
                    await insertAuditLog(guildId, userId, AUDIT_ACTIONS.RATE_LIMITED, { 
                        interaction: plugin.name 
                    });
                    continue;
                }
            }
            
            await plugin.execute(interaction);
            
            if (guildId) {
                await insertAuditLog(guildId, userId, AUDIT_ACTIONS.COMMAND_EXECUTED, { 
                    interaction: plugin.name,
                    type: getInteractionType(interaction)
                });
            }
            
            break;
            
        } catch (error) {
            console.error(`Interaction plugin ${plugin.name} error:`, error);
            
            if (guildId) {
                await insertAuditLog(guildId, userId, AUDIT_ACTIONS.ERROR_OCCURRED, { 
                    interaction: plugin.name,
                    error: error.message 
                });
            }
            
            if (plugin.handleError) {
                await plugin.handleError(interaction, error);
            } else {
                try {
                    const content = 'An error occurred while processing your interaction.';
                    
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ content, flags: EPHEMERAL });
                    } else {
                        await interaction.reply({ content, flags: EPHEMERAL });
                    }
                } catch (replyError) {
                    console.error('Failed to send error response:', replyError);
                }
            }
        }
    }
}

function getInteractionType(interaction) {
    if (interaction.isButton()) return 'button';
    if (interaction.isStringSelectMenu()) return 'select';
    if (interaction.isModalSubmit()) return 'modal';
    if (interaction.isContextMenuCommand()) return 'context';
    return 'unknown';
}

function reloadInteractionPlugins() {
    interactionPlugins.clear();
    loadInteractionPlugins();
    console.log(`Loaded ${interactionPlugins.size} interaction plugins`);
}

loadInteractionPlugins();

module.exports = {
    processInteraction,
    reloadInteractionPlugins,
    getLoadedPlugins: () => Array.from(interactionPlugins.keys())
};