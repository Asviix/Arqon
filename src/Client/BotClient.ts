// src\Client\BotClient.ts

import { Command } from '@/commands/BaseCommand';
import { MySQLClient } from '@/database/mySQLClient';
import { EventHandler } from '@/events/BaseEvent';
import * as dbI from '@/interfaces/dbConfig';
import * as dbS from '@/interfaces/shared';
import { CacheManager } from '@/managers/cacheManager';
import { ConfigManager } from '@/managers/ConfigManager';
import { LocaleStrings, LocalizationManager } from '@/managers/localizationManager';
import { BrowserService } from '@/utils/BrowserService';
import { Logger } from '@/utils/Logger';
import { Client, ClientOptions, Collection, ColorResolvable } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * The BotClient class that extends client.
 */
export class BotClient extends Client {
    private static instance: BotClient;

    // Interfaces
    public locales: LocaleStrings = {};
    public guildConfigsCache: Collection<string, dbI.GuildConfig> = new Collection();
    public hltvPlayersCacheNick: Collection<string, number[]> = new Collection();
    public hltvPlayersCacheID: Collection<number, dbS.HltvPlayer> = new Collection();

    // Classes
    public commands: Collection<string, Command> = new Collection();
    public eventFiles: Collection<string, EventHandler> = new Collection();
    public cooldowns: Collection<string, Collection<string, number>> = new Collection();
    public db!: MySQLClient;
    public localizationManager!: LocalizationManager;
    public configManager!: ConfigManager;
    public cacheManager!: CacheManager;
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
        this.db = MySQLClient.getInstance();
        this.localizationManager = LocalizationManager.getInstance(this);
        this.configManager = ConfigManager.getInstance(this, this.db);
        this.cacheManager = CacheManager.getInstance(this);

        // Initialize required services.
        await this.browserService.launchBrowser();

        Logger.init(this);

        this.locales = await this.localizationManager.loadLocales();

        Logger.debug('Logging into Discord...');
        await this.login(token);
    };
};