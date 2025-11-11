// src\Commands\ping\pingCommand\services\embedsGenerator.ts

import { EmbedBuilder } from "discord.js";
import { CommandContext } from "../../BaseCommand";
import { PingData } from "../command";

export function createPingEmbed(context: CommandContext, data: PingData): EmbedBuilder {
    const LMA = context.client.localizationManager;
    const title: string = LMA.getString(context.languageCode, "COMMAND_PING_EMBED_TITLE");
    const field_title: string = LMA.getString(context.languageCode, "COMMAND_PING_EMBED_FIELD_TITLE");
    const field_description: string = LMA.getString(context.languageCode, "COMMAND_PING_EMBED_FIELD_DESCRIPTION", {
        'wsping': data.ws.toString(),
        'apiLatency': data.apiLatency.toString(),
        'uptime': data.uptime
    });

    return new EmbedBuilder()
        .setTitle(title)
        .setColor('#ffa200')
        .addFields(
            { name: field_title, value: field_description}
        )
        .setTimestamp();
}