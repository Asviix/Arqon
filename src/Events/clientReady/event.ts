// src\Events\clientReady\event.ts

import 'dotenv/config'
import { Logger } from '../../Utils/Logger';
import { BotClient } from '../../Client/BotClient';
import { EventHandler } from '../BaseEvent';
import { ActivityType, ApplicationCommandDataResolvable } from 'discord.js';
import { sendLogMessage, setActivity } from './methods';

export default class ReadyEvent extends EventHandler {
    public name = 'clientReady';
    public once = true;

    public async execute(client: BotClient): Promise<void> {
        if (!client.user || !client.application) return;

        const commandData: ApplicationCommandDataResolvable[] = Array.from(client.commands.values()).map(command => command.commandData);
        Logger.info(`Registering ${commandData.length} guild commands...`);
        try {
            const DEV_DISCORD_ID: any = process.env.DEV_DISCORD_ID;

            await client.application.commands.set(commandData, DEV_DISCORD_ID);
        } catch (error) {
            Logger.error(`\nError during command registration:\n`, error);
        };

        Logger.debug('Setting activity...');
        setActivity(client, 'Your advanced features!', ActivityType.Watching);

        Logger.info('Sending log message...');
        sendLogMessage(client);


        Logger.success(`Bot is online! Logged in as ${client.user.tag}`);
        Logger.info(`Bot Client ID: ${client.application.id}`);
    };
};