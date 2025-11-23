//src/Commands/hltv/subCommands/playerStats/subCommand.ts

import { AttachmentBuilder, EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import sharp from 'sharp';
import * as cheerio from 'cheerio';
import { CommandContext } from '@/commands/baseCommand';
import { createStatsEmbed } from './services/embedsGenerator';
import { HLTV_PLAYER_IDS as playerIds } from '@/config/hltvPlayerDatabase';
import { HTTPResponse } from 'puppeteer';
import { playerStatsHTMLData as htmlData } from './data/htmlScrapeData';

export async function getPlayerStats(
        c: CommandContext,
        playerName: string,
        gameVersion: string,
        startDate: string,
        endDate: string,
        mapInput: string,):
    Promise<InteractionReplyOptions> {

    const _ = c._;
    let returnPayload: InteractionReplyOptions;

    if (/\s/.test(playerName)) {
        returnPayload = {
            content: 'The `name` parameter cannot include spaces or other whitespace!'
        };
    };

    function isValidDateString(dateStr: string): boolean {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return false;
        };

        const date = new Date(dateStr);

        if (isNaN(date.getTime())) {
            return false;
        };

        const [year, month, day] = dateStr.split('-').map(Number);
    
        return date.getFullYear() === year 
            && date.getMonth() === month - 1
            && date.getDate() === day;
    };

    if (startDate && endDate) {
        if (!isValidDateString(startDate) || !isValidDateString(startDate)) {
            returnPayload = {
                content: 'Invalid date format or value. Please use YYYY-MM-DD.'
            };
            return returnPayload;
        };
    };

    const page = await c.client.browserService.getNewPage();
    await page.setRequestInterception(true);

    page.on('request', (request) => {
        const url = request.url();

        if (url.includes('consent.cookiebot.com')) {
            request.abort();
        } else {
            request.continue();
        };
    });

    const filters: string[] = []
    gameVersion ? filters.push(gameVersion) : ''
    mapInput ? filters.push(mapInput) : ''

    const dateFilter: string[] = []
    startDate ? dateFilter.push(startDate) : ''
    endDate ? dateFilter.push(endDate) : '';

    if (mapInput) {
        const VALID_MAPS: string[] = ['de_ancient', 'de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_overpass', 'de_train', 'de_anubis', 'de_cache', 'de_cobblestone', 'de_season', 'de_tuscan', 'de_vertigo'];
        const mapArray = mapInput.split(',').map(map => map.trim()).filter(map => map.length > 0);
        const invalidMaps = mapArray.filter(map => !VALID_MAPS.includes(map));
        
        if (invalidMaps.length > 0) {
            const invalidParametersEmbed = new EmbedBuilder()
                .setTitle(_.COMMAND_HTLV_PLAYER_STATS_INVALID_MAP_PARAMETERS_TITLE())
                .setColor(c.client.embedOrangeColor)
                .addFields(
                    {
                        name: (_.COMMAND_HTLV_PLAYER_STATS_INVALID_MAP_PARAMETERS_FIELD_NAME()),
                        value: _.COMMAND_HTLV_PLAYER_STATS_INVALID_MAP_PARAMETERS_FIELD_VALUE(),
                    }
                )
                .setTimestamp();
            returnPayload = {
                embeds: [invalidParametersEmbed]
            };
        };
    };

    const ids: Record<string, number> = playerIds;
    let statsUrl: string;
    let playerId: string;
    if (!Object.prototype.hasOwnProperty.call(ids, playerName.toLowerCase())) {
        await page.goto(`https://www.hltv.org/search?query=${playerName.toLowerCase()}`, {
            waitUntil: 'domcontentloaded',
            referer: 'https://www.htlv.org',
            timeout: 10000
        });
        

        let html = await page.content();
        let $ = cheerio.load(html)

        const searchContainer = $('div.contentCol');

        const tables = searchContainer.find('table.table')
        const statsUrlContent = tables.find('> tbody > tr:nth-child(2) > td > a').attr('href') as string;
        if (!statsUrlContent) {
            returnPayload = {
                content: 'Your search returned no result.'
            };
            return returnPayload;
        };
        const regex = /^\/player\/(\d+)\/([a-zA-Z0-9_-]+)$/
        const match = statsUrlContent.match(regex);

        if (!match) {
            returnPayload = {
                content: 'Your search returned no result.'
            };
            return returnPayload;
        };

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

        if (startDate && endDate) {
            queryParams.push(`startDate=${startDate}&endDate=${endDate}`);
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

    const response: HTTPResponse | null = await page.goto(statsUrl, {
        waitUntil: 'networkidle2',
        referer: 'https://www.htlv.org',
        timeout: 10000
    });

    if (!response) {
        returnPayload = {
            content: 'Navigation failed: Received no HTTP response from HTLV.'
        };
        return returnPayload;
    };

    const statusCode = response.status();

    if (statusCode === 403) {
        returnPayload = {
            content: 'HLTV Blocked Request (403 Forbidden).'
        };
        return returnPayload;
    };

    if (statusCode >= 400) {
        returnPayload = {
            content: `HTLV Request Failed: HTTP Status ${statusCode}`
        };
        return returnPayload;
    };

    const UNWANTED_SELECTORS = [
        'div.player-summary-stat-box-right-top',
        'a.player-summary-stat-box-left-btn',
        'div.role-stats-filter-wrapper',
        'div.role-stats-section-arrow'
    ];

    await page.evaluate((selectors) => {
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);

            elements.forEach(element => {
                (element as HTMLElement).style.display = 'none'
            });
        }
    }, UNWANTED_SELECTORS);

    const NAME_WRAPPER = 'div.player-summary-stat-box-left-text-wrapper';

    await page.evaluate((selectors) => {
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);

            elements.forEach(element => {
                (element as HTMLElement).style.bottom = '10px'
            });
        }
    }, [NAME_WRAPPER]);

    const topStatsElement = await page.waitForSelector(htmlData.topStatsContainer);
    const topStatsImageBuffer = await topStatsElement?.screenshot({
        type: 'png'
    }) as Buffer;
    const roleStatsElement = await page.waitForSelector(htmlData.roleStatsContainer);
    const roleStatsImageBuffer = await roleStatsElement?.screenshot({
        type: 'png'
    }) as Buffer;

    const topStatsMetadata = await sharp(topStatsImageBuffer).metadata();
    const roleStatsMetadata = await sharp(roleStatsImageBuffer).metadata();


    if (!topStatsMetadata.width || !topStatsMetadata.height || !roleStatsMetadata.height) {
        throw new Error('Failed to get image dimensions for sharp composition.');
    };

    const totalHeight = topStatsMetadata.height + roleStatsMetadata.height;
    const commonWidth = topStatsMetadata.width;

    const combinedImageBuffer = await sharp({
        create: {
            width: commonWidth,
            height: totalHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
    .composite([
        { 
            input: topStatsImageBuffer, 
            top: 0, 
            left: 0 
        },
        { 
            input: roleStatsImageBuffer, 
            top: topStatsMetadata.height,
            left: 0 
        }
    ])
    .png()
    .toBuffer();

    const attachementName = 'htlv_player_card.png'
    const fileAttachement = new AttachmentBuilder(combinedImageBuffer)
        .setName(attachementName);

    const html = await page.content();
    const $ = cheerio.load(html);

    const statsContainer = $(htmlData.summaryStats);
    const topStats = statsContainer.find(htmlData.topStatsContainer);

    // Player Info
    const playerFullName = statsContainer.find(htmlData.playerBodyShot).attr('alt');

    // Map Count
    const mapCount = topStats.find(htmlData.mapCount).text().trim();
    
    const stats = {
        filters,
        dateFilter,
        statsUrl,
        attachementName,
        playerName: playerFullName as string,
        mapCount
    };

    const playerStatsEmbed = createStatsEmbed(c, stats)

    await page.close();

    returnPayload = {
        embeds: [playerStatsEmbed],
        files: [fileAttachement]
    };

    return returnPayload;
};