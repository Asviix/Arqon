// src\Client\BotClient.ts

import { Command } from '@/commands/baseCommand';
import { EventHandler } from '@/events/baseEvent';
import { ConfigManager } from '@/managers/configManager';
import { LocaleStrings, LocalizationManager } from '@/managers/localizationManager';
import { BrowserService } from '@/utils/browserService';
import { Logger } from '@/utils/logger';
import * as dspe from '@discord-player/extractor';
import * as dsp from 'discord-player';
import { Client, ClientOptions, Collection, ColorResolvable } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { YoutubeSabrExtractor } from 'discord-player-googlevideo';

export class BotClient extends Client {
    private static instance: BotClient;

    // Interfaces
    public locales: LocaleStrings = {};

    // Classes
    public commands: Collection<string, Command> = new Collection();
    public eventFiles: Collection<string, EventHandler> = new Collection();
    public cooldowns: Collection<string, Collection<string, number>> = new Collection();
    public localizationManager!: LocalizationManager;
    public configManager!: ConfigManager;
    public browserService!: BrowserService;

    // Colors
    public embedOrangeColor: ColorResolvable = '#ffa200';

    // Misc
    public isProd: boolean = process.argv.includes('--env=production');
    public uuid: string = uuidv4();

    private constructor(options: ClientOptions) {
        super(options);
    };

    public static async getInstance(options: ClientOptions): Promise<BotClient> {
        if (!BotClient.instance) {
            Logger.debug('Creating BotClient instance...');
            BotClient.instance = new BotClient(options);
        };
        return BotClient.instance;
    };

    public async start(token: string) {

        // Get the instances for singletons.
        this.browserService = BrowserService.getInstance();
        this.localizationManager = LocalizationManager.getInstance(this);
        this.configManager = ConfigManager.getInstance(this);

        const player = new dsp.Player(this);

        await player.extractors.register(YoutubeSabrExtractor, {});
        await player.extractors.loadMulti(dspe.DefaultExtractors);
        

        // Initialize required services.
        await this.browserService.launchBrowser();

        Logger.init(this);

        this.locales = await this.localizationManager.loadLocales();

        Logger.debug('Logging into Discord...');
        await this.login(token);
    };
};