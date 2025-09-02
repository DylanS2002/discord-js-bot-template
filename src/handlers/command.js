// Text command handler
const { processMessage } = require('./message');
const { processSlashCommand } = require('./slash');
const { processInteraction } = require('./interaction');
const { logUserJoin, logUserLeave, logServerAdd, logServerRemove, logError } = require('./audit');

function registerEventHandlers(client) {
    client.on('messageCreate', async (message) => {
        try {
            await processMessage(message);
        } catch (error) {
            console.error('Message processing error:', error);
            await logError(error, { 
                guildId: message.guild?.id,
                userId: message.author?.id,
                messageId: message.id 
            });
        }
    });
    
    client.on('interactionCreate', async (interaction) => {
        try {
            if (interaction.isChatInputCommand()) {
                await processSlashCommand(interaction);
            } else {
                await processInteraction(interaction);
            }
        } catch (error) {
            console.error('Interaction processing error:', error);
            await logError(error, { 
                guildId: interaction.guild?.id,
                userId: interaction.user?.id,
                interactionId: interaction.id 
            });
        }
    });
    
    client.on('guildMemberAdd', async (member) => {
        try {
            await logUserJoin(member.guild.id, member.user.id);
        } catch (error) {
            console.error('Guild member add logging error:', error);
        }
    });
    
    client.on('guildMemberRemove', async (member) => {
        try {
            await logUserLeave(member.guild.id, member.user.id);
        } catch (error) {
            console.error('Guild member remove logging error:', error);
        }
    });
    
    client.on('guildCreate', async (guild) => {
        try {
            await logServerAdd(guild.id);
            console.log(`Joined server: ${guild.name} (${guild.memberCount} members)`);
        } catch (error) {
            console.error('Guild create logging error:', error);
        }
    });
    
    client.on('guildDelete', async (guild) => {
        try {
            await logServerRemove(guild.id);
            console.log(`Left server: ${guild.name}`);
        } catch (error) {
            console.error('Guild delete logging error:', error);
        }
    });
}

function reloadAllPlugins() {
    const { reloadPlugins } = require('./message');
    const { reloadSlashPlugins } = require('./slash');
    const { reloadInteractionPlugins } = require('./interaction');
    
    reloadPlugins();
    reloadSlashPlugins();
    reloadInteractionPlugins();
}

function getLoadedPlugins() {
    const { getLoadedPlugins: getMessagePlugins } = require('./message');
    const { getLoadedPlugins: getSlashPlugins } = require('./slash');
    const { getLoadedPlugins: getInteractionPlugins } = require('./interaction');
    
    return {
        ...getMessagePlugins(),
        slash: getSlashPlugins(),
        interactions: getInteractionPlugins()
    };
}

module.exports = {
    registerEventHandlers,
    reloadAllPlugins,
    getLoadedPlugins
};