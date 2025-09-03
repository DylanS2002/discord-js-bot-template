// src/plugins/interactions/button.js - Example interaction plugin
module.exports = {
    type: 'interaction',
    name: 'button_handler',
    
    filter(interaction) {
        return interaction.isButton() && interaction.customId.startsWith('example_');
    },
    
    async execute(interaction) {
        const action = interaction.customId.split('_')[1];
        
        switch(action) {
            case 'confirm':
                await interaction.reply({ content: 'Confirmed!', flags: 64 });
                break;
            case 'cancel':
                await interaction.reply({ content: 'Cancelled!', flags: 64 });
                break;
        }
    }
};