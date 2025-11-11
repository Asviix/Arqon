// deploy_clear_commands.js (Temporary Script)
const { REST, Routes } = require('discord.js');
// Assuming you use environment variables for your IDs and token
require('dotenv').config(); 

const GUILD_ID = process.env.DEV_DISCORD_ID; // Replace with the ID of your server
const CLIENT_ID = process.env.CLIENT_ID; // Your bot's application ID
const BOT_TOKEN = process.env.DISCORD_TOKEN; 

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

(async () => {
    try {
        console.log(`Attempting to clear commands for guild ${GUILD_ID}...`);

        // Use Routes.applicationGuildCommands to target a specific server
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            { body: [] }, // Send an empty array to overwrite and delete all existing guild commands
        );

        console.log('Successfully cleared all guild commands!');
        
        // OPTIONAL: If you suspect the duplicates might be from a past *global* registration
        // (ping and shutdown often are), you can clear global commands too.
        // NOTE: This can take up to an hour to take effect.
        
        console.log('Attempting to clear all global commands...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: [] },
        );
        console.log('Successfully cleared all global commands! (Update may take up to 1 hour)');
        

    } catch (error) {
        console.error('Error during command clearing:', error);
    }
})();