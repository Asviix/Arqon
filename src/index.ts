// src\index.ts

import 'dotenv/config'; // Load Environment Variables from .env file
import { Logger } from './Utils/Logger';
import { GatewayIntentBits } from 'discord.js';
import { BotClient } from './Client/BotClient';
import { CommandHandler } from './Handlers/CommandHandler';
import { EventLoadHandler } from './Handlers/EventHandler';

const args = process.argv;
const isProduction = args.includes('--env=production');

Logger.setEnvironment(isProduction);
Logger.debug('Started in debug!');

const DISCORD_TOKEN_ENV: any = process.env.DISCORD_TOKEN;
const DISCORD_TOKEN: string = DISCORD_TOKEN_ENV.toString();

Logger.debug('Checking environment token...');
if (!DISCORD_TOKEN || typeof DISCORD_TOKEN !== 'string') {
    throw new Error('DISCORD_TOKEN is not set in environment variables.');
};

Logger.debug('Creating the BotClient...');
const client = new BotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

async function main() {
    Logger.info('Starting bot initalization...');

    Logger.debug('Starting the commandHandler...');
    await new CommandHandler(client).load();
    Logger.debug('Starting the eventHandler...');
    await new EventLoadHandler(client).load();

    await client.start(DISCORD_TOKEN);
};

main().catch(error => {
    Logger.error('Fatal error!\n', error);
    process.exit(1);
});