// src\index.ts

export const startTime = Date.now();

import 'dotenv/config'; // Load Environment Variables from .env file
import { GatewayIntentBits } from 'discord.js';
import * as path from 'path';
import { BotClient } from '@/client/botClient';
import { CommandHandler } from '@/handlers/commandHandler';
import { EventLoadHandler } from '@/handlers/eventHandler';
import { Logger } from '@/utils/logger';

Logger.info(`\n\n==================\nNEW INSTANCE\n==================\n\n`)

export const COMMANDS_BASE_DIR: string = path.join(__dirname, 'Commands');

const args = process.argv;
const isProduction = args.includes('--env=production');

Logger.setEnvironment(isProduction);
Logger.debug('Started in debug!');

const DISCORD_TOKEN: string = process.env.DISCORD_TOKEN!.toString();
Logger.debug('Checking environment token...');
if (!DISCORD_TOKEN || typeof DISCORD_TOKEN !== 'string') {
    throw new Error('DISCORD_TOKEN is not set in environment variables.');
};

Logger.debug('Creating the BotClient...');
const clientOptions = {
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
};

async function main() {
    Logger.info('Starting bot initalization...');

    const client = await BotClient.getInstance(clientOptions);

    await new CommandHandler(client).load();
    await new EventLoadHandler(client).load();

    await client.start(DISCORD_TOKEN);
};

main().catch (error => {
    Logger.error('Fatal error!\n', error);
    process.exit(1);
});