// src/plugins/messages/welcome.js - Example message plugin
module.exports = {
    type: 'message',
    name: 'welcome',
    description: 'Welcomes new members',
    
    filter(message) {
        return message.type === 7; // GUILD_MEMBER_JOIN
    },
    
    async execute(message) {
        await message.channel.send(`Welcome ${message.author}!`);
    }
};