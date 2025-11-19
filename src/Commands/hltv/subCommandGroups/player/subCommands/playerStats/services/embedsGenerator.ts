// src\Commands\hltv\subCommands\playerStats\services\embedsGenerator.ts

import * as i from "./interfaces";
import { EmbedBuilder } from "discord.js";
import { CommandContext } from "@/Commands/BaseCommand";

export function createStatsEmbed(c: CommandContext, stats: i.Stats): EmbedBuilder {
    const _ = c._;
    const description = _.COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION({
        filters: stats.filters.length > 0 ? stats.filters.join(', ') : 'None.',
        mapCount: stats.mapCount
    });

    return new EmbedBuilder()
        .setTitle(`${stats.playerName}`)
        .setURL(stats.statsUrl)
        .setImage(`attachment://${stats.attachementName}`)
        .setDescription(description)
        .setColor(c.client.embedOrangeColor)
        .setTimestamp();
};