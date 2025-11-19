// src\Commands\hltv\methods\live\services\embedsGenerator.ts

import * as i from "./interfaces";
import { EmbedBuilder } from "discord.js";
import { CommandContext } from "@/Commands/BaseCommand";
import { createTranslator } from "@/Locales/TranslatorHelper";

function createMatchFields(context: CommandContext, matchesData: i.Match[]): { name: string, value: string, inline: boolean }[] {
    const _ = createTranslator(context.client, context.languageCode);
    return matchesData.map((match: i.Match) => {
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


export function createMatchEmbed(context: CommandContext, matchesData: i.Match[]): EmbedBuilder {
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