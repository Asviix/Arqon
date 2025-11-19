//src/Commands/hltv/subCommands/playerStats/subCommand.ts

import { EmbedBuilder } from 'discord.js';
import * as cheerio from 'cheerio';
import { browserService } from '@/Utils/BrowserService';
import { CommandContext } from '@/Commands/BaseCommand';
import { createStatsEmbed } from './services/embedsGenerator';
import { HLTV_PLAYER_IDS as playerIds } from '@/Config/hltvPlayerDatabase';
import { playerStatsHTMLData as htmlData } from './data/htmlScrapeData';

export async function getPlayerStats(c: CommandContext, playerName: string, gameVersion: string, matchType: string, mapInput: string): Promise<EmbedBuilder> {
    const _ = c._;
    const page = await browserService.getNewPage();

    const filters: string[] = []
    gameVersion ? filters.push(gameVersion) : ''
    matchType ? filters.push(matchType) : ''
    mapInput ? filters.push(mapInput) : ''

    if (mapInput) {
        const VALID_MAPS: string[] = ['de_ancient', 'de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_overpass', 'de_train', 'de_anubis', 'de_cache', 'de_cobblestone', 'de_season', 'de_tuscan', 'de_vertigo'];
        const mapArray = mapInput.split(',').map(map => map.trim()).filter(map => map.length > 0);
        const invalidMaps = mapArray.filter(map => !VALID_MAPS.includes(map));
        
        if (invalidMaps.length > 0) {
            return new EmbedBuilder()
                .setTitle(_.BASE_ERROR_COMMAND_NOT_FOUND())
                .setColor(c.client.embedOrangeColor)
                .addFields(
                    {
                        name: (_.COMMAND_HTLV_PLAYER_STATS_INVALID_MAP_PARAMETERS_FIELD_NAME()),
                        value: _.COMMAND_HTLV_PLAYER_STATS_INVALID_MAP_PARAMETERS_FIELD_VALUE(),
                    }
                )
                .setTimestamp();
        };
    };

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
            .replace('[player]', playerName.toLowerCase());
    };

    if (c.interaction.options) {
        let queryParams: string[] = [];

        if (gameVersion) {
            queryParams.push(`csVersion=${gameVersion}`);
        };

        if (matchType) {
            queryParams.push(`matchType=${matchType}`);
        };

        if (mapInput) {
            const mapArray = mapInput
                .split(',')
                .map(map => map.trim())
                .filter(map => map.length > 0);

            if (mapArray.length > 0) {
                mapArray.forEach(map => {
                    queryParams.push(`maps=${map}`)
                });
            };
        };

        if (queryParams.length != 0) {
            statsUrl = `${statsUrl}?${queryParams.join('&')}`;
        };
    };

    await page.goto(statsUrl, {
        waitUntil: 'networkidle2',
        referer: 'https://www.htlv.org',
        timeout: 10000
    });

    const html = await page.content();
    const $ = cheerio.load(html);

    const statsContainer = $(htmlData.summaryStats);
    const topStats = statsContainer.find(htmlData.topStatsContainer);

    // Player Info
    const playerImageURL = statsContainer.find(htmlData.playerBodyShot).attr('src');
    const playerFullName = statsContainer.find(htmlData.playerBodyShot).attr('alt');

    // Map Count
    const mapCount = topStats.find(htmlData.mapCount).text().trim();

    // Side Ratings
    const sideRatings = topStats.find(htmlData.sideRating);
    const tRating = sideRatings.eq(0).contents().eq(2).get(0) as Text | undefined;
    const ctRating = sideRatings.eq(1).contents().eq(2).get(0) as Text | undefined;
    const boxRating = topStats.find(htmlData.boxRating).text().trim();
    const boxRatingType = topStats.find(htmlData.boxRatingType).eq(0).contents().eq(0).get(0) as Text | undefined;

    // Performance Metrics
    const performanceMetrics = topStats.find(htmlData.performanceMetrics);
    const roundSwing = performanceMetrics.eq(0).children().eq(0).contents().eq(0).get(0) as Text | undefined;
    const deathPerRound = performanceMetrics.eq(1).children().eq(0).text().trim();
    const kast = performanceMetrics.eq(2).children().eq(0).contents().eq(0).get(0) as Text | undefined;
    const multiKill = performanceMetrics.eq(3).children().eq(0).contents().eq(0).get(0) as Text | undefined;
    const adr = performanceMetrics.eq(4).children().eq(0).text().trim();
    const kpr = performanceMetrics.eq(5).children().eq(0).text().trim();

    // Role Stats
    const roleStats = statsContainer.find(htmlData.roleStatsScore);
    const firepowerRating = roleStats.eq(0).contents().eq(0).get(0) as Text | undefined;
    const entryingRating = roleStats.eq(3).contents().eq(0).get(0) as Text | undefined;
    const tradingRating = roleStats.eq(6).contents().eq(0).get(0) as Text | undefined;
    const openingRating = roleStats.eq(9).contents().eq(0).get(0) as Text | undefined;
    const clutchingRating = roleStats.eq(12).contents().eq(0).get(0) as Text | undefined;
    const snipingRating = roleStats.eq(15).contents().eq(0).get(0) as Text | undefined;
    const utilityRating = roleStats.eq(18).contents().eq(0).get(0) as Text | undefined;
    
    const stats = {
        filters,
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
        kpr,
        firepowerRating: firepowerRating?.data.trim() as string,
        entryingRating: entryingRating?.data.trim() as string,
        tradingRating: tradingRating?.data.trim() as string,
        openingRating: openingRating?.data.trim() as string,
        clutchingRating: clutchingRating?.data.trim() as string,
        snipingRating: snipingRating?.data.trim() as string,
        utilityRating: utilityRating?.data.trim() as string
    };

    const playerStatsEmbed = createStatsEmbed(c, stats)

    await page.close();
    return playerStatsEmbed;
};