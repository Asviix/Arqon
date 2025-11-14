// src\Utils\BrowserService.ts

import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Logger } from "@/Utils/Logger";

puppeteer.use(StealthPlugin());

class BrowserService {
    private static instance: BrowserService;
    private browser: Browser | null = null;
    private userAgent: string = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    private constructor() {};

    public static getInstance(): BrowserService {
        if (!BrowserService.instance) {
            Logger.debug('Creating BrowserService instance...')
            BrowserService.instance = new BrowserService();
        };
        return BrowserService.instance;
    };

    public async launchBrowser(): Promise<void> {
        if (!this.browser) {
        Logger.info('Starting headless browser...')
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                protocolTimeout: 180000,
            });
        };
    };

    public async getNewPage(): Promise<Page> {
        if (this.browser) {
            await this.launchBrowser();
        };

        const page = await this.browser!.newPage();
        await page.setUserAgent(this.userAgent);
        return page;
    };

    public async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        };
    };
};

export const browserService = BrowserService.getInstance();