const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    type: 'slash',
    name: 'info',
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get bot information'),
    
    async execute(interaction) {
        const uptime = process.uptime();
        const memory = process.memoryUsage().heapUsed / 1024 / 1024;
        
        await interaction.reply({
            content: `Bot Uptime: ${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s\nMemory: ${memory.toFixed(2)}MB`,
            flags: 64
        });
    }
};