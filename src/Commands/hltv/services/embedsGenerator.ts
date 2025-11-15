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
        const name = LMA.getString(context.languageCode, "COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_NAME", {
            meta: match.meta.toUpperCase(),
            team1: match.team1,
            team2: match.team2
        });
        const value = LMA.getString(context.languageCode, "COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_VALUE", {
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
        .setColor('#ffa200')
        .setThumbnail('https://www.hltv.org/img/static/TopSmallLogo2x.png')
        .addFields(createMatchFields(context, matchesData))
        .setTimestamp();
};

interface Stats {
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
    kpr: string
}

export function createStatsEmbed(context: CommandContext, stats: Stats): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle(`${stats.playerName}`)
        .setURL(stats.statsUrl)
        .setThumbnail(stats.playerImageURL)
        .setDescription(`Stats Over ${stats.mapCount}:`)
        .setColor('#ffa200')
        .addFields(
            {
                name: 'Ratings',
                value: `
                    CT Rating: **${stats.ctRating}**
                    T Rating: **${stats.tRating}**
                    ${stats.boxRatingType}: **${stats.boxRating}**
                `,
                inline: false
            },  
            {
                name: 'Performance Metrics',
                value: `
                    Round Swing: **${stats.roundSwing}%**
                    Death Per Round: **${stats.deathPerRound}**
                    KAST: **${stats.kast}%**
                    Multi-Kills: **${stats.multiKill}%**
                    ADR: **${stats.adr}**
                    KPR: **${stats.kpr}**
                `,
                inline: true
            }
        )
        .setTimestamp();
};