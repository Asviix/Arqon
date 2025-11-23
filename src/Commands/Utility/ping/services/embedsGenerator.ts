// src\Commands\ping\pingCommand\services\embedsGenerator.ts

import { EmbedBuilder } from "discord.js";
import { CommandContext } from "@/commands/baseCommand";

interface PingData {
    ws: number,
    apiLatency: number,
    uptime: string
};

export function createPingEmbed(c: CommandContext, data: PingData): EmbedBuilder {
    const _ = c._;
    const title: string = _.COMMAND_PING_EMBED_TITLE();
    const field_title: string = _.COMMAND_PING_EMBED_FIELD_TITLE();
    const field_description: string = _.COMMAND_PING_EMBED_FIELD_DESCRIPTION({
        wsping: data.ws.toString(),
        apiLatency: data.apiLatency.toString(),
        uptime: data.uptime
    });

    return new EmbedBuilder()
        .setTitle(title)
        .setColor(c.client.embedOrangeColor)
        .addFields(
            { name: field_title, value: field_description}
        )
        .setTimestamp();
}