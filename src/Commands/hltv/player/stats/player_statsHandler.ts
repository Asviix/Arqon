// src\commands\hltv\player\stats\player_statsHandler.ts

import { CommandContext } from "@/commands/baseCommand";
import * as dbI from '@prisma/client';
import * as cheerio from "cheerio";
import { ActionRowBuilder, AttachmentBuilder, BaseMessageOptions, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction } from "discord.js";
import { ElementHandle, HTTPResponse, Page } from "puppeteer";
import sharp from "sharp";
import { hltvRefs } from "./data/hltvRefs";
import { statsData } from "./data/interfaces";

export class player_statsHandler {
    private c: CommandContext
    private ephemeral: boolean
    private playerName: string;
    private gameVersion: string | null;
    private start_date: string | null;
    private end_date: string | null;

    constructor(c: CommandContext) {
        this.c = c;
        this.ephemeral = this.c.interaction.options.getBoolean('ephemeral', true);
        this.playerName = this.c.interaction.options.getString('name', true);
        this.gameVersion = this.c.interaction.options.getString('game_version');
        this.start_date = this.c.interaction.options.getString('start_date');
        this.end_date = this.c.interaction.options.getString('end_date');
    };

    public async main(): Promise<BaseMessageOptions> {
        let payload: BaseMessageOptions;

        if (this.start_date && this.end_date) {
            let isDateValid = this.validateDate();
            if (isDateValid) {
                return payload = isDateValid as BaseMessageOptions;
            };
        };

        const page = await this.c.client.browserService.getNewPage();

        this.denyCookies(page);

        const statsUrl = await this.getStatsUrl(page);

        if (!(typeof statsUrl === 'string')) {
            return payload = statsUrl as BaseMessageOptions;
        };

        const httpReponse: HTTPResponse | null = await page.goto(statsUrl, {
            waitUntil: 'networkidle2',
            referer: 'https://hltv.org',
            timeout: 10000
        });
        
        const blockage = this.isBlocked(httpReponse);

        if (blockage) {
            this.c.client.browserService.closeBrowser();
            return payload = blockage as BaseMessageOptions;
        };

        this.adjustCSS(page);

        const [stats, attachement] = await this.scrapeHTML(page, statsUrl);

        await page.close();

        const embed = this.createEmbed(stats);

        payload = {
            content: '',
            embeds: [embed],
            files: [attachement]
        };

        return payload;
    };

    private validateDate(): BaseMessageOptions | boolean {
        let payload: BaseMessageOptions;

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

        if (this.start_date && this.end_date) {
            if (!isValidDateString(this.start_date) || !isValidDateString(this.end_date)) {
                payload = {
                    content: this.c._.COMMAND_HLTV_PLAYER_STATS_INVALID_DATE_FORMAT(),
                };
                return payload;
            };
        };

        return false;
    };

    private denyCookies(p: Page) {
        p.setRequestInterception(true);
        p.on('request', (req) => {
            const url = req.url();

            if (url.includes('consent.cookiebot.com')) {
                req.abort();
            } else {
                req.continue();
            };
        });
    };

    private async getStatsUrl(p: Page): Promise<string | BaseMessageOptions> {
        const players = await this.getPlayers(p, this.playerName);

        if (!players) {
            return {
                content: this.c._.COMMAND_HLTV_PLAYER_STATS_SEARCH_NO_RESULT(),
            };
        };

        let playerId;
        let playerName;

        let userResponse: number | BaseMessageOptions;

        if (players.length === 1) {
            userResponse = 0;
        } else {
            userResponse = await this.handleComponents(players);
            if (typeof userResponse !== 'number') {
                return userResponse;
            };
        };

        playerId = players[userResponse].player_id;
        playerName = players[userResponse].nickname;

        const sanitizedNickname = playerName!.replace(/\s+/g, '-');

        let statsUrl: string = hltvRefs.STATS_URL
            .replace('[id]', playerId.toString())
            .replace('[player]', (Math.random().toString(36).slice(2, 8)));

        let queryParams: string[] = [];

        queryParams.push()

        if (this.gameVersion) {
            queryParams.push(`csVersion=${this.gameVersion}`);
        };

        if (this.start_date && this.end_date) {
            queryParams.push(`startDate=${this.start_date}&endDate=${this.end_date}`)
        };

        if (queryParams.length > 0) {
            statsUrl = `${statsUrl}?${queryParams.join('&')}`;
        };

        return statsUrl;
    };

    private async getPlayers(p: Page, query: string): Promise<dbI.HltvPlayer[] | void> {
        const cachedPlayers = await this.c.client.configManager.get('hltvPlayers', query);
        if (cachedPlayers) {
            return cachedPlayers
        };

        const players = await this.fetchPlayersFromHLTV(p, query)

        players.forEach(async (player) => {
            await this.c.client.configManager.set('hltvPlayer', player.nickname as string, player);
        });

        return players;
    };

    private async fetchPlayersFromHLTV(p: Page, query: string): Promise<dbI.HltvPlayer[]> {
        await p.goto(`https://www.hltv.org/search?query=${query.toLowerCase()}`, {
            waitUntil: 'domcontentloaded',
            referer: 'https://www.hltv.org',
            timeout: 10000
        });

        const html = await p.content();
        const $ = cheerio.load(html);
        const searchField = $('div.search');

        const tables = searchField.find('table.table');
        const players: dbI.HltvPlayer[] = [];

        tables.each((tableIndex, tableElement) => {
            const $table = $(tableElement);
            const headers = $table.find('td.table-header');

            let hasPlayerHeader = false;
            headers.each((i, header) => {
                const text = $(header).text().trim();
                if (text.toLowerCase() === 'player') {
                    hasPlayerHeader = true;
                }
            });

            if (!hasPlayerHeader) return;

            const rows = $table.find('tr').slice(1);

            rows.each((rowIndex, rowElement) => {
                const $row = $(rowElement);
                const $cell = $row.find('td').first();
                const $link = $cell.find('a');

                if ($link.length === 0) return;

                const href = $link.attr('href') || '';
                const idMatch = href.match(/\/player\/(\d+)\//);
                if (!idMatch) return; // skip if no player ID
                const player_id = idMatch[1];

                const country = $link.find('img').attr('title') || '';

                const fullNameText = $link.text().trim();

                let first_name = '';
                let nickname = '';
                let last_name = '';

                const match = fullNameText.match(/^(.+?)\s+["'](.+)["'](?:\s+(.+))?$/);

                if (match) {
                    first_name = match[1].trim();
                    nickname = match[2].trim();
                    last_name = match[3]?.trim() || '';
                } else {
                    const nickMatch = fullNameText.match(/^["'](.+)["']$/);
                    if (nickMatch) {
                        nickname = nickMatch[1].trim();
                    } else {
                        nickname = fullNameText;
                    }
                }

                players.push({
                    player_id,
                    first_name,
                    last_name,
                    nickname,
                    country
                });
            });
        });
        
        return players;
    };

    private async handleComponents(players: dbI.HltvPlayer[]): Promise<BaseMessageOptions | number> {
        const rows = this.createActionRows(players);
        const embed = this.createComponentEmbed(players);

        await this.createButtonMessage(rows, embed);

        const filter = (i: Interaction) =>
            i.user.id === this.c.interaction.user.id &&
            i.isButton() &&
            i.customId.startsWith('select_player_')

        let buttonInteraction;

        try {
            buttonInteraction = await this.c.interaction.channel?.awaitMessageComponent({
                filter,
                time: 30_000
            });
        } catch (e) {
            return {
                content: this.c._.COMMAND_HLTV_PLAYER_STATS_MENU_NO_SELECTION(),
                components: [],
                embeds: []
            };
        };

        if (!buttonInteraction) {
            return {
                content: this.c._.COMMAND_HLTV_PLAYER_STATS_MENU_NO_INTERACT(),
                components: [],
                embeds: []
            };
        };

        const index = parseInt(buttonInteraction.customId.replace('select_player_', ''), 10);
        const selectedPlayer = players[index];

        await buttonInteraction.update({
            content: `${this.c._.COMMAND_HLTV_PLAYER_STATS_MENU_SELECT_RESULT()} **${selectedPlayer.first_name} '${selectedPlayer.nickname}' ${selectedPlayer.last_name}**...`,
            embeds: [],
            components: []
        });

        return index;
    };

    private createActionRows(players: dbI.HltvPlayer[]): ActionRowBuilder<ButtonBuilder>[] {
        const rows: ActionRowBuilder<ButtonBuilder>[] = [];
        let currentRow = new ActionRowBuilder<ButtonBuilder>();

        players.forEach((player, index) => {
            if (currentRow.components.length === 5) {
                rows.push(currentRow);
                currentRow = new ActionRowBuilder<ButtonBuilder>();
            };

            currentRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`select_player_${index}`)
                    .setLabel((index + 1).toString())
                    .setStyle(ButtonStyle.Primary)
            );
        });

        if (currentRow.components.length > 0) rows.push(currentRow);

        return rows;
    };

    private createComponentEmbed(players: dbI.HltvPlayer[]): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle('Select a player')
            .setColor(this.c.client.embedOrangeColor)
            .setDescription(
                players.map((p, i) => `${i + 1}: ${p.first_name} '${p.nickname}' ${p.last_name}`).join('\n')
            )
    };

    private async createButtonMessage(rows: ActionRowBuilder<ButtonBuilder>[], embed: EmbedBuilder): Promise<void> {
        await this.c.interaction.editReply({
            embeds: [embed],
            components: rows
        });
    };

    private isBlocked(r: HTTPResponse | null): BaseMessageOptions | boolean {
        let payload: BaseMessageOptions;

        if (!r) {
            payload = {
                content: this.c._.COMMAND_HLTV_NAVIG_FAIL_NO_RESPONSE(),
            };
            return payload;
        };

        if (r.status() === 403) {
            payload = {
                content: this.c._.COMMAND_HLTV_NAVIG_FAIL_403(),
            };
            return payload
        };

        return false
    };

    private async adjustCSS(p: Page) {
        await p.evaluate((selectors) => {
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);

                elements.forEach(element => {
                    (element as HTMLElement).style.display = 'none'
                });
            };
        }, hltvRefs.UNWANTED_SELECTORS);

        await p.evaluate((selectors) => {
            for (const selector of selectors) {
                const elements = document.querySelectorAll(selector);

                elements.forEach(element => {
                    (element as HTMLElement).style.bottom = '10px'
                });
            };
        }, [hltvRefs.NAME_WRAPPER]);
    };

    private getFilters(): [string[], string[]] {
        const filters: string[] = [];
        const dateFilter: string[] = [];

        this.gameVersion ? filters.push(this.gameVersion): null;

        this.start_date && this.end_date ? dateFilter.push(this.start_date, this.end_date) : null;

        return [filters, dateFilter];
    };

    private async scrapeHTML(p: Page, statsUrl: string): Promise<[statsData, AttachmentBuilder]> {
        const topStatsElement = await p.waitForSelector(hltvRefs.topStatsContainer);
        const roleStatsElement = await p.waitForSelector(hltvRefs.roleStatsContainer);

        if (!(topStatsElement) || !(roleStatsElement)) {
            throw new Error('Unable to find the player cards.');
        };

        const attachement = await this.takeScreenshots(topStatsElement, roleStatsElement);

        const html = await p.content();
        const $ = cheerio.load(html);

        const statsContainer = $(hltvRefs.summaryStats);
        const topStats = statsContainer.find(hltvRefs.topStatsContainer);

        const playerFullName = statsContainer.find(hltvRefs.playerBodyShot).attr('alt');

        const mapCount = topStats.find(hltvRefs.mapCount).text().trim();

        const [filters, dateFilter] = this.getFilters();

        const stats = {
            filters,
            dateFilter,
            statsUrl,
            attachementName: attachement.name as string,
            playerName: playerFullName as string,
            mapCount
        };

        return [stats, attachement];
    };

    private async takeScreenshots(topStatsElement: ElementHandle<Element>, roleStatsElement: ElementHandle<Element>): Promise<AttachmentBuilder> {
        const topStatsImageBuffer = await topStatsElement.screenshot({
            type: 'png'
        }) as Buffer;

        const roleStatsImageBuffer = await roleStatsElement.screenshot({
            type: 'png'
        }) as Buffer;

        const topStatsMetadata = await sharp(topStatsImageBuffer).metadata();
        const roleStatsMetadata = await sharp(roleStatsImageBuffer).metadata();

        if (!topStatsMetadata.width || !topStatsMetadata.height || !roleStatsMetadata.width || !roleStatsMetadata.height) {
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

        const attachementName = 'hltv_player_card.png';
        const fileAttachement = new AttachmentBuilder(combinedImageBuffer)
            .setName(attachementName);

        return fileAttachement;
    };

    private createEmbed(stats: statsData): EmbedBuilder {
        let description: string | null = null;
        if (stats.filters.length > 0 || stats.dateFilter.length > 0) {
            if (stats.filters.length > 0) {
                description = `**Filters:** ${stats.filters.join(', ')}`
            };

            if (stats.filters.length > 0 || stats.dateFilter.length > 0) {
                description += '\n'
            };

            if (stats.dateFilter.length > 0) {
                description += `**Range:** ${stats.dateFilter.join(' - ')}`
            };
        };

        if (stats.filters.length > 0 || stats.dateFilter.length > 0) {
            description += `\n**Map Count:** ${stats.mapCount}`;
        } else {
            description = `**Map Count:** ${stats.mapCount}`;
        };


        return new EmbedBuilder()
            .setTitle(stats.playerName)
            .setURL(stats.statsUrl)
            .setImage('attachment://' + stats.attachementName)
            .setDescription(description)
            .setColor(this.c.client.embedOrangeColor)
            .setTimestamp();
    };
};