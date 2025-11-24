// src\commands\hltv\player\stats\player_statsHandler.ts

import { CommandContext } from "@/commands/baseCommand";
import { InteractionReplyOptions, MessageFlags } from "discord.js";
import { HTTPResponse, Page } from "puppeteer";
import { HLTV_PLAYER_IDS as playerIds } from "@/config/hltvPlayerDatabase";
import { hltvRefs } from "./data/hltvRefs";

export class player_statsHandler {
    private c: CommandContext

    constructor(c: CommandContext) {
        this.c = c;
    };

    public async main(): Promise<InteractionReplyOptions> {
        //do stuff
    };

    private async getStats(): Promise<InteractionReplyOptions> {
        let payload: InteractionReplyOptions;

        const page = await this.c.client.browserService.getNewPage();

        this.denyCookies(page);

        const httpReponse: HTTPResponse | null = await page.goto(this.getStatsUrl(this.c.interaction.options.getString('name', true)));
        const blockage = this.isBlocked(httpReponse);

        if (blockage) {
            return payload = blockage as InteractionReplyOptions;
        };

        this.adjustCSS(page);

        
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

    private getStatsUrl(name: string): string {
        const ids: Record<string, number> = playerIds;
        let statsUrl: string = '';
        let playerId: string;

        if (Object.prototype.hasOwnProperty.call(ids, name.toLowerCase())) {
            playerId = ids[name.toLowerCase()].toString();
            statsUrl = hltvRefs.STATS_URL
                .replace('[id]', playerId)
                .replace('[player]', name);
        };

        return statsUrl;
    };

    private isBlocked(r: HTTPResponse | null): InteractionReplyOptions | boolean {
        let payload: InteractionReplyOptions;

        if (!r) {
            payload = {
                content: 'Navigation failed: Received no HTTP response from HLTV.',
                flags: MessageFlags.Ephemeral
            };
            return payload;
        };

        if (r.status() === 403) {
            payload = {
                content: 'HLTV Blocked the Request. (403 Forbidden)',
                flags: MessageFlags.Ephemeral
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
};