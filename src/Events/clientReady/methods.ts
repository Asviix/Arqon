// src\Events\clientReady\methods.ts

import { ActivityType, ClientUser, TextChannel } from "discord.js";
import { BotClient } from "@/Client/BotClient";
import { Logger } from "@/Utils/Logger";
import { sendLogMessage_Embed } from './embeds';

export async function clientReadyRunMethods(client: BotClient, name: string, type: ActivityType): Promise<void> {
    await setActivity(client, name, type);
    await logPinMessage(client);
};

async function setActivity(client: BotClient, name: string, type: ActivityType): Promise<void> {
    Logger.debug('Setting activity...');
    if (client.user) {
        client.user.setActivity({
            name: name,
            type: type
        });
    } else {
        Logger.warn('Cannot set activity: Client user object is not available.');
    }
};

async function logPinMessage(client: BotClient): Promise<void> {
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

        const pins = await DEV_DISCORD_LOGS_CHANNEL.messages.fetchPins();
        let clientUser: ClientUser;
        if (client.user) {
            clientUser = client.user;
        } else {
            return Logger.warn('Cannot update pinned message: Client user object is not available.');
        };
        
        const botPinnedMessage = pins.items.find(message => message.message.author.id === clientUser.id);

        if (botPinnedMessage) {
            Logger.debug('Found status message, Editing...');
            await botPinnedMessage.message.edit({ embeds: [statusEmbed] });
        } else {
            Logger.debug('Status message not found, Creating...');
            const newMessage = await DEV_DISCORD_LOGS_CHANNEL.send({ embeds: [statusEmbed] });
            Logger.debug('Pinning the new message...');
            await newMessage.pin();
        };
    } catch (error) {
        Logger.warn('Error sending log message!\n', error);
    };
};