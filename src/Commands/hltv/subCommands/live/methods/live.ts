// src\Commands\hltv\methods\live\methods\live.ts

import { EmbedBuilder } from 'discord.js';
import * as cheerio from 'cheerio';
import { browserService } from '@/Utils/BrowserService';
import { CommandContext } from '@/Commands/BaseCommand';
import { createMatchEmbed } from '../services/embedsGenerator';
import { liveMatchesHTMLData as htmlData } from '../data/htmlScrapeData';

export async function getLiveMatches(context: CommandContext): Promise<EmbedBuilder> {
    
    const page = await browserService.getNewPage();

    await page.goto(htmlData.MATCHES_URL, {
        waitUntil: 'networkidle2',
        referer: 'https://www.hltv.org',
        timeout: 10000
    });
    
    const html = await page.content();
    const $ = cheerio.load(html);
    const matchesContainer = $(htmlData.liveMatchDiv);
    const matchesElements = matchesContainer.find(htmlData.liveMatchWrapper);
    const matchesData: {matchLink: string, event: string, meta: string, team1: string, team2: string, currentScore1: string, currentScore2: string, mapScore1: string, mapScore2: string}[] = [];

    matchesElements.each((index, element) => {
        const $link = $(element);

        const $matchTop = $link.find(htmlData.liveMatchTop);
        const event = $matchTop.find(htmlData.liveMatchTopEventName).attr('data-event-headline')?.trim() as string;

        const matchLink = $matchTop.attr('href') as string;

        const $matchInfo = $link.find(htmlData.liveMatchInfo);
        const meta = $matchInfo.children().eq(1).text().toUpperCase().trim();

        const $matchTeams = $link.find(htmlData.liveMatchTeams);
        const teamNames = $matchTeams.find(htmlData.liveMatchTeamNames);
        const team1 = teamNames.eq(0).text().trim();
        const team2 = teamNames.eq(1).text().trim();

        const $matchScore = $link.find(htmlData.liveMatchScore);
        const currentScore1 = $matchScore.find(htmlData.liveMatchScoreCurrentScore).eq(0).text().trim();
        const currentScore2 = $matchScore.find(htmlData.liveMatchScoreCurrentScore).eq(1).text().trim();
        const mapScore1 = $matchScore.find(htmlData.liveMatchScoreMapScore).eq(0).children('span').text().trim();
        const mapScore2 = $matchScore.find(htmlData.liveMatchScoreMapScore).eq(1).children('span').text().trim();



        matchesData.push({
            matchLink: matchLink,
            event: event,
            meta: meta,
            team1: team1,
            team2: team2,
            currentScore1: currentScore1,
            currentScore2: currentScore2,
            mapScore1: mapScore1,
            mapScore2: mapScore2
        });
    });

    const liveMatchesEmbed = createMatchEmbed(context, matchesData);

    await page.close();
    return liveMatchesEmbed;
};