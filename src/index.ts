// src\index.ts

import 'dotenv/config'; // Load Environment Variables from .env file
import { Logger } from './Utils/Logger';
import { GatewayIntentBits } from 'discord.js';
import { BotClient } from './Client/BotClient';
import { CommandHandler } from './Handlers/CommandHandler';
import { EventLoadHandler } from './Handlers/EventHandler';

const args = process.argv;
const isProduction = args.includes('--env=production');

const DISCORD_TOKEN_ENV: any = process.env.DISCORD_TOKEN;
const DISCORD_TOKEN: string = DISCORD_TOKEN_ENV.toString();

if (!DISCORD_TOKEN || typeof DISCORD_TOKEN !== 'string') {
    throw new Error('DISCORD_TOKEN is not set in environment variables.');
};

const client = new BotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

Logger.setEnvironment(isProduction);
Logger.debug('Started in debug!')

async function main() {
    Logger.info('Starting bot initalization...')

    await new CommandHandler(client).load();
    await new EventLoadHandler(client).load();

    Logger.info('Connecting to Discord...')

    await client.start(DISCORD_TOKEN);
};

main().catch(error => {
    Logger.error('Fatal error!\n', error);
    process.exit(1);
});