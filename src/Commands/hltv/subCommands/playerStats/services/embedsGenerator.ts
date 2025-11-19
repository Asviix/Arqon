// src\Commands\hltv\subCommands\playerStats\services\embedsGenerator.ts

import * as i from "./interfaces";
import { EmbedBuilder } from "discord.js";
import { CommandContext } from "@/Commands/BaseCommand";
import { createTranslator } from "@/Locales/TranslatorHelper";

export function createStatsEmbed(context: CommandContext, stats: i.Stats): EmbedBuilder {
    const _ = createTranslator(context.client, context.languageCode);
    const description = _('COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION', {
        'filters': stats.filters.length > 0 ? stats.filters.join(', ') : 'None.',
        'mapCount': stats.mapCount
    });

    const ratingsFieldName = _('COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_RATINGS_NAME');
    const ratingsFieldValue = _('COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_RATINGS_VALUE', {
        'ctRating': stats.ctRating,
        'tRating': stats.tRating,
        'boxRatingType': stats.boxRatingType,
        'boxRating': stats.boxRating
    });

    const metricsFieldName = _('COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_METRICS_NAME');
    const metricsFieldValue = _('COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_METRICS_VALUE', {
        'roundSwing': stats.roundSwing,
        'deathPerRound': stats.deathPerRound,
        'kast': stats.kast,
        'multikills': stats.multiKill,
        'adr': stats.adr,
        'kpr': stats.kpr
    });

    const roleFieldName = _('COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_ROLES_NAME');
    const roleFieldValue = _('COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_ROLES_VALUE', {
        'firepowerRating': stats.firepowerRating,
        'entryingRating': stats.entryingRating,
        'tradingRating': stats.entryingRating,
        'openingRating': stats.openingRating,
        'clutchingRating': stats.clutchingRating,
        'snipingRating': stats.snipingRating,
        'utilityRating': stats.utilityRating
    });

    return new EmbedBuilder()
        .setTitle(`${stats.playerName}`)
        .setURL(stats.statsUrl)
        .setThumbnail(stats.playerImageURL)
        .setDescription(description)
        .setColor(context.client.embedOrangeColor)
        .addFields(
            {
                name: ratingsFieldName,
                value: ratingsFieldValue,
                inline: true
            },  
            {
                name: metricsFieldName,
                value: metricsFieldValue,
                inline: true
            },
            {
                name: roleFieldName,
                value: roleFieldValue,
                inline: true
            }
        )
        .setTimestamp();
};