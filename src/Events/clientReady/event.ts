// src\Events\clientReady\event.ts

import 'dotenv/config'
import { Logger } from '../../Utils/Logger';
import { BotClient } from '../../Client/BotClient';
import { EventHandler } from '../BaseEvent';
import { ApplicationCommandDataResolvable, ActivityType } from 'discord.js';

export default class ReadyEvent extends EventHandler {
    public name = 'clientReady';
    public once = true;

    public async execute(client: BotClient): Promise<void> {
        if (!client.user || !client.application) return;

        Logger.success(`Bot is online! Logged in as ${client.user.tag}`);
        Logger.info(`Bot Client ID: ${client.application.id}`);

        client.user.setActivity({
            name: "Your advanced features",
            type: ActivityType.Watching
        });

        const commandData: ApplicationCommandDataResolvable[] = Array.from(client.commands.values()).map(command => command.commandData);

        Logger.info(`Registering ${commandData.length} guild commands...`);

        try {
            const DEV_DISCORD_ID: any = process.env.DEV_DISCORD_ID;

            await client.application.commands.set(commandData, DEV_DISCORD_ID);
        } catch (error) {
            Logger.error(`\nError during command registration:\n`, error);
        };
    };
};