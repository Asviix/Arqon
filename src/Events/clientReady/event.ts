// src\Events\clientReady\event.ts

import 'dotenv/config'
import { ActivityType, ApplicationCommandDataResolvable } from 'discord.js';
import { BotClient } from '@/Client/BotClient';
import { clientReadyRunMethods } from './methods';
import { EventHandler } from '@/Events/BaseEvent';
import { Logger } from '@/Utils/Logger';

export default class ReadyEvent extends EventHandler {
    public name = 'clientReady';
    public once = true;

    public async execute(client: BotClient): Promise<void> {
        const SYNC_INTERVAL_MS = 5 * 60 * 1000;

        if (!client.user || !client.application) return;

        const commandData: ApplicationCommandDataResolvable[] = Array.from(client.commands.values()).map(command => command.commandData);
        Logger.info(`Registering ${commandData.length} guild commands...`);
        try {
            const DEV_DISCORD_ID: any = process.env.DEV_DISCORD_ID;

            await client.application.commands.set(commandData, DEV_DISCORD_ID);
        } catch (error) {
            Logger.error(`\nError during command registration:\n`, error);
        };

        await clientReadyRunMethods(client, 'Your advanced features!', ActivityType.Watching);

        setInterval(() => {
            client.db.syncSessionCounters();
        }, SYNC_INTERVAL_MS);

        Logger.success(`Bot is online! Logged in as ${client.user.tag}`);
        Logger.info(`Bot Client ID: ${client.application.id}`);
    };
};