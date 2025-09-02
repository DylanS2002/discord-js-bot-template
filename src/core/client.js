const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const { INTENTS } = require('./constants');
const { initializeDatabase } = require('../data');
const { registerEventHandlers } = require('../handlers/command');
const { startApiServer } = require('../api/server');

const client = new Client({
    intents: [
        GatewayIntentBits[INTENTS.GUILDS],
        GatewayIntentBits[INTENTS.GUILD_MESSAGES],
        GatewayIntentBits[INTENTS.MESSAGE_CONTENT],
        GatewayIntentBits[INTENTS.DIRECT_MESSAGES]
    ]
});

client.once('ready', async () => {
    try {
        await initializeDatabase();
        registerEventHandlers(client);
        
        if (config.api.enabled) {
            await startApiServer();
        }
        
        console.log(`Logged in as ${client.user.tag} - All systems ready`);
    } catch (error) {
        console.error('Bot initialization failed:', error);
        process.exit(1);
    }
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});

client.on('warn', (warning) => {
    console.warn('Discord client warning:', warning);
});

module.exports = client;