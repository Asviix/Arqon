// src\Events\clientReady\embeds.ts

import { EmbedBuilder } from "discord.js";

interface sendLogMessage_EmbedData {
    latency: number;
    guild_count: number;
    startupTime: Date;
}

export function sendLogMessage_Embed(data: sendLogMessage_EmbedData): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(`✅ Bot is online!`)
        .setColor(0x00FF00)
        .setDescription(`Service successfully initialized and connected to Discord.`)
        .setAuthor({
            name: 'Arqon'
        })
        .addFields(
            { name: `**Envrionment:**`, value: `Production` },
            { name: `**Latency**`, value: `${data.latency}ms` },
            { name: `**Total Guilds:**`, value: `${data.guild_count}` }
        )
        .setTimestamp(data.startupTime);
}
    