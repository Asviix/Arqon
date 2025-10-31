// src\Events\clientReady\methods.ts

import { Logger } from "../../Utils/Logger";
import { BotClient } from "../../Client/BotClient";
import { ActivityType, TextChannel } from "discord.js";
import { sendLogMessage_Embed } from './embeds';

export async function setActivity(client: BotClient, name: string, type: ActivityType): Promise<void> {
    Logger.debug('Setting activity...');
    if (client.user) {
        client.user.setActivity({
            name: name,
            type: type
        });
    } else {
        Logger.warn('Cannot set activity: Client user object is not available.')
    }
};

export async function logPinMessage(client: BotClient): Promise<void> {
    Logger.info('Editing pinned message...');
    const DEV_DISCORD_GUILD = await client.guilds.fetch(process.env.DEV_DISCORD_ID as string);

    try {
        const DEV_DISCORD_LOGS_CHANNEL = DEV_DISCORD_GUILD.channels.cache.get(process.env.DEV_LOGS_CHANNEL as string) as TextChannel;

        const statusEmbed = sendLogMessage_Embed({
            isProd: client.isProd,
            latency: client.ws.ping,
            guild_count: client.guilds.cache.size,
            startupTime: new Date()
        });

        DEV_DISCORD_LOGS_CHANNEL.messages.fetchPins()
            .then(messages => {
                if (messages.items.length === 0) {
                    Logger.debug('Pinned message not found, creating...');

                    DEV_DISCORD_LOGS_CHANNEL.send({
                        embeds: [statusEmbed]
                    }).then(message => {
                        message.pin();
                    });
                } else {
                    if (messages.items[0].message.author.id === client.user!.id) {
                        messages.items[0].message.edit({
                            embeds: [statusEmbed]
                        });
                    };
                };
            });
    } catch (error) {
        Logger.warn('Error sending log message!\n', error);
    };
};