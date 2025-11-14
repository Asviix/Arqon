// src\Commands\hltv\methods\live.ts

import * as cheerio from 'cheerio';
import { browserService } from '../../../../Utils/BrowserService';
import { createMatchEmbed } from '../../services/embedsGenerator';
import { EmbedBuilder } from 'discord.js';
import { CommandContext } from '../../../BaseCommand';

export async function getLiveMatches(context: CommandContext): Promise<EmbedBuilder> {
    const EVENTS_URL = 'https://www.hltv.org/matches';
    
    const page = await browserService.getNewPage();

    await page.goto(EVENTS_URL, {
        waitUntil: 'networkidle2',
        referer: 'https://www.hltv.org',
        timeout: 10000
    });

    const liveMatchDiv = 'div.liveMatches';

    await page.waitForSelector(liveMatchDiv, { 
        visible: true,
        timeout: 5000
    });

    const liveMatchWrapper = 'div.match-wrapper.live-match-container';

    const liveMatchTop = 'a.match-top';
    const liveMatchTopEventName = 'div.match-event.text-ellipsis';

    const liveMatchInfo = 'a.match-info';

    const liveMatchTeams = 'a.match-teams';
    const liveMatchTeamNames = 'div.match-teamname';

    const liveMatchScore = 'a.match-team-livescore';
    const liveMatchScoreCurrentScore = 'span.current-map-score';
    const liveMatchScoreMapScore = 'span.map-score';
    
    const html = await page.content();
    const $ = cheerio.load(html);
    const matchesContainer = $(liveMatchDiv);
    const matchesElements = matchesContainer.find(liveMatchWrapper);
    const matchesData: {matchLink: string, event: string, meta: string, team1: string, team2: string, currentScore1: string, currentScore2: string, mapScore1: string, mapScore2: string}[] = [];

    matchesElements.each((index, element) => {
        const $link = $(element);

        const $matchTop = $link.find(liveMatchTop);
        const event = $matchTop.find(liveMatchTopEventName).attr('data-event-headline')?.trim() as string;

        const matchLink = $matchTop.attr('href') as string;

        const $matchInfo = $link.find(liveMatchInfo);
        const meta = $matchInfo.children().eq(1).text().toUpperCase().trim();

        const $matchTeams = $link.find(liveMatchTeams);
        const teamNames = $matchTeams.find(liveMatchTeamNames);
        const team1 = teamNames.eq(0).text().trim();
        const team2 = teamNames.eq(1).text().trim();

        const $matchScore = $link.find(liveMatchScore);
        const currentScore1 = $matchScore.find(liveMatchScoreCurrentScore).eq(0).text().trim();
        const currentScore2 = $matchScore.find(liveMatchScoreCurrentScore).eq(1).text().trim();
        const mapScore1 = $matchScore.find(liveMatchScoreMapScore).eq(0).children('span').text().trim();
        const mapScore2 = $matchScore.find(liveMatchScoreMapScore).eq(1).children('span').text().trim();



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