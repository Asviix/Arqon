// src\Commands\hltv\services\embedsGenerator.ts

import { EmbedBuilder } from "discord.js";
import { CommandContext } from "@/Commands/BaseCommand";
import { createTranslator } from "@/Locales/TranslatorHelper";

interface Match {
    matchLink: string,
    event: string,
    meta: string,
    team1: string,
    team2: string,
    currentScore1: string,
    currentScore2: string,
    mapScore1: string,
    mapScore2: string
}

function createMatchFields(context: CommandContext, matchesData: Match[]): { name: string, value: string, inline: boolean }[] {
    const _ = createTranslator(context.client, context.languageCode);
    return matchesData.map((match: Match) => {
        const name = _('COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_NAME', {
            meta: match.meta.toUpperCase(),
            team1: match.team1,
            team2: match.team2
        });

        const value = _('COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_VALUE', {
            event: match.event,
            currentScore1: match.currentScore1.replace('-', '0'),
            currentScore2: match.currentScore2.replace('-', '0'),
            mapScore1: match.mapScore1,
            mapScore2: match.mapScore2,
            matchLink: match.matchLink
        }).trim();

        return {
            name: name,
            value: value,
            inline: false, 
        };
    });
};


export function createMatchEmbed(context: CommandContext, matchesData: Match[]): EmbedBuilder {
    const _ = createTranslator(context.client, context.languageCode);
    const title: string = _('COMMAND_HLTV_LIVE_MATCHES_EMBED_TITLE');
    const description: string = _('COMMAND_HLTV_LIVE_MATCHES_EMBED_DESCRIPTION', {
        matches: matchesData.length.toString()
    });

    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(context.client.embedOrangeColor)
        .setThumbnail('https://www.hltv.org/img/static/TopSmallLogo2x.png')
        .addFields(createMatchFields(context, matchesData))
        .setTimestamp();
};

interface Stats {
    filters: string[]
    statsUrl: string,
    playerName: string,
    playerImageURL: string,
    mapCount: string,
    tRating: string,
    ctRating: string,
    boxRating: string,
    boxRatingType: string,
    roundSwing: string,
    deathPerRound: string,
    kast: string,
    multiKill: string,
    adr: string,
    kpr: string,
    firepowerRating: string,
    entryingRating: string,
    tradingRating: string,
    openingRating: string,
    clutchingRating: string,
    snipingRating: string,
    utilityRating: string
}

export function createStatsEmbed(context: CommandContext, stats: Stats): EmbedBuilder {
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