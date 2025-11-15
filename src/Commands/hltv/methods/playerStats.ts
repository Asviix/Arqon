// src\Commands\hltv\methods\playerStats.ts

import * as cheerio from 'cheerio';
import { browserService } from '@/Utils/BrowserService';
import { playerStatsHTMLData as htmlData } from '../data/htmlScrapeData';
import { HLTV_PLAYER_IDS as playerIds } from '@/Config/hltvPlayerDatabase';
import { EmbedBuilder } from 'discord.js';
import { CommandContext } from '@/Commands/BaseCommand';
import { createStatsEmbed } from '../services/embedsGenerator';

export async function getPlayerStats(context: CommandContext, playerName: string): Promise<EmbedBuilder> {
    const page = await browserService.getNewPage();
    const ids: Record<string, number> = playerIds;

    let statsUrl: string;
    let playerId: string;
    if (!Object.prototype.hasOwnProperty.call(ids, playerName.toLowerCase())) {
        await page.goto(`https://www.hltv.org/search?query=${playerName.toLowerCase()}`, {
            waitUntil: 'networkidle2',
            referer: 'https://www.htlv.org',
            timeout: 10000
        });
        

        let html = await page.content();
        let $ = cheerio.load(html)

        const searchContainer = $('div.contentCol');

        const tables = searchContainer.find('table.table')
        const statsUrlContent = tables.find('> tbody > tr:nth-child(2) > td > a').attr('href') as string;
        const regex = /^\/player\/(\d+)\/([a-zA-Z0-9_-]+)$/
        const match = statsUrlContent.match(regex);
        playerId = match![1];
        playerName = match![2];

        statsUrl = htmlData.STATS_URL
            .replace('[id]', playerId)
            .replace('[player]', playerName);
    } else {
        playerId = ids[playerName.toLowerCase()].toString();
        statsUrl = htmlData.STATS_URL
            .replace('[id]', playerId.toString())
            .replace('[player]', playerName);
    };

    await page.goto(statsUrl + '?startDate=2025-01-01&endDate=2025-12-31', {
        waitUntil: 'networkidle2',
        referer: 'https://www.htlv.org',
        timeout: 10000
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    const statsContainer = $(htmlData.summaryStats)

    const playerImageURL = statsContainer.find(htmlData.playerBodyShot).attr('src');
    const playerFullName = statsContainer.find(htmlData.playerBodyShot).attr('alt');

    const topStats = statsContainer.find(htmlData.topStatsContainer);

    const mapCount = topStats.find(htmlData.mapCount).text().trim();

    const sideRatings = topStats.find(htmlData.sideRating);
    const tRating = sideRatings.eq(0).contents().eq(2).get(0) as Text | undefined;
    const ctRating = sideRatings.eq(1).contents().eq(2).get(0) as Text | undefined;

    const boxRating = topStats.find(htmlData.boxRating).text().trim();
    const boxRatingType = topStats.find(htmlData.boxRatingType).eq(0).contents().eq(0).get(0) as Text | undefined;

    const performanceMetrics = topStats.find(htmlData.performanceMetrics);
    const roundSwing = performanceMetrics.eq(0).children().eq(0).contents().eq(0).get(0) as Text | undefined;
    const deathPerRound = performanceMetrics.eq(1).children().eq(0).text().trim();
    const kast = performanceMetrics.eq(2).children().eq(0).contents().eq(0).get(0) as Text | undefined;
    const multiKill = performanceMetrics.eq(3).children().eq(0).contents().eq(0).get(0) as Text | undefined;
    const adr = performanceMetrics.eq(4).children().eq(0).text().trim();
    const kpr = performanceMetrics.eq(5).children().eq(0).text().trim();

    
    
    const stats = {
        statsUrl,
        playerName: playerFullName as string,
        playerImageURL: playerImageURL as string,
        mapCount,
        tRating: tRating?.data.trim() as string,
        ctRating: ctRating?.data.trim() as string,
        boxRating,
        boxRatingType: boxRatingType?.data.trim() as string,
        roundSwing: roundSwing?.data.trim() as string,
        deathPerRound,
        kast: kast?.data.trim() as string,
        multiKill: multiKill?.data.trim() as string,
        adr,
        kpr
    };

    const playerStatsEmbed = createStatsEmbed(context, stats)

    await page.close();
    return playerStatsEmbed;
};