// src\Commands\hltv\subCommands\playerStats\services\embedsGenerator.ts

import * as i from "./interfaces";
import { EmbedBuilder } from "discord.js";
import { CommandContext } from "@/Commands/BaseCommand";

export function createStatsEmbed(c: CommandContext, stats: i.Stats): EmbedBuilder {
    const _ = c._;
    let description: string = '';
    if (!(stats.dateFilter.length === 0)) {
        description = _.COMMAND_HLTV_PLAYER_STATS_EMBED_DESCRIPTION_RANGE({
            startDate: stats.dateFilter[0],
            endDate: stats.dateFilter[1]
        }) + '\n';
    };

    description = description + _.COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION({
        filters: stats.filters.length > 0 ? stats.filters.join(', ') : 'None.',
        mapCount: stats.mapCount,
    });

    return new EmbedBuilder()
        .setTitle(`${stats.playerName}`)
        .setURL(stats.statsUrl)
        .setImage(`attachment://${stats.attachementName}`)
        .setDescription(description)
        .setColor(c.client.embedOrangeColor)
        .setTimestamp();
};