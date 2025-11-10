// src\Commands\hltv\services\embedsGenerator.ts

import { EmbedBuilder } from "discord.js";

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

function createMatchFields(matchesData: Match[]): { name: string, value: string, inline: boolean }[] {
    return matchesData.map((match: Match) => {
        const name = `**[${match.meta.toUpperCase()}]** ${match.team1} vs ${match.team2}`;
        const value = `
        Event: **${match.event}**
        Score: \`${match.currentScore1} - ${match.currentScore2} (${match.mapScore1} - ${match.mapScore2})\`
        [🔗 Event Link](https://hltv.org${match.matchLink})
        `.trim();

        return {
            name: name,
            value: value,
            inline: false, 
        };
    });
};


export function createMatchEmbed(matchesData: Match[]): EmbedBuilder {
    return new EmbedBuilder()
        .setTitle('**LIVE HLTV MATCHES**')
        .setDescription(`Currently tracking **${matchesData.length}** active matches.`)
        .setColor('#ffa200')
        .addFields(createMatchFields(matchesData))
        .setTimestamp();
};