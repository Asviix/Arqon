// src\Commands\hltv\services\embedsGenerator.ts

import { EmbedBuilder } from "discord.js";
import { CommandContext } from "@/Commands/BaseCommand";

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
    const LMA = context.client.localizationManager;
    return matchesData.map((match: Match) => {
        const name = LMA.getString(context.languageCode, 'COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_NAME', {
            meta: match.meta.toUpperCase(),
            team1: match.team1,
            team2: match.team2
        });
        const value = LMA.getString(context.languageCode, 'COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_VALUE', {
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
    const LMA = context.client.localizationManager;
    const title: string = LMA.getString(context.languageCode, 'COMMAND_HLTV_LIVE_MATCHES_EMBED_TITLE');
    const description: string = LMA.getString(context.languageCode, 'COMMAND_HLTV_LIVE_MATCHES_EMBED_DESCRIPTION', {
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
    const LMA = context.client.localizationManager;
    const description = LMA.getString(context.languageCode, 'COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION', {
        'filters': stats.filters.length > 0 ? stats.filters.join(', ') : 'None.',
        'mapCount': stats.mapCount
    });

    const ratingsFieldName = LMA.getString(context.languageCode, 'COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_RATINGS_NAME');
    const ratingsFieldValue = LMA.getString(context.languageCode, 'COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_RATINGS_VALUE', {
        'ctRating': stats.ctRating,
        'tRating': stats.tRating,
        'boxRatingType': stats.boxRatingType,
        'boxRating': stats.boxRating
    });

    const metricsFieldName = LMA.getString(context.languageCode, 'COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_METRICS_NAME');
    const metricsFieldValue = LMA.getString(context.languageCode, 'COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_METRICS_VALUE', {
        'roundSwing': stats.roundSwing,
        'deathPerRound': stats.deathPerRound,
        'kast': stats.kast,
        'multikills': stats.multiKill,
        'adr': stats.adr,
        'kpr': stats.kpr
    });

    const roleFieldName = LMA.getString(context.languageCode, 'COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_ROLES_NAME');
    const roleFieldValue = LMA.getString(context.languageCode, 'COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_ROLES_VALUE', {
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