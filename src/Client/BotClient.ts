// src\Client\BotClient.ts

import { Client, Collection, ClientOptions, ColorResolvable } from 'discord.js';
import { v4 as uuidv4 } from 'uuid';
import { BrowserService } from '@/Utils/BrowserService';
import { EventHandler } from '@/Events/BaseEvent';
import { ConfigManager } from '@/Managers/ConfigManager';
import { Command } from '@/Commands/BaseCommand';
import { LocaleStrings, LocalizationManager } from '@/Managers/LocalizationManager';
import { Logger } from '@/Utils/Logger';
import { MySQLClient, GuildConfig } from '@/Database/MySQLClient';

/**
 * The BotClient class that extends client.
 */
export class BotClient extends Client {
    private static instance: BotClient;

    // Interfaces
    public locales: LocaleStrings = {};
    public guildConfigs: Collection<string, GuildConfig> = new Collection();
    public isProd: boolean = process.argv.includes('--env=production');

    // Classes
    public commands: Collection<string, Command> = new Collection();
    public eventFiles: Collection<string, EventHandler> = new Collection();
    public cooldowns: Collection<string, Collection<string, number>> = new Collection();
    public db!: MySQLClient;
    public localizationManager!: LocalizationManager;
    public configManager!: ConfigManager;
    public browserService!: BrowserService;

    // Colors
    public embedOrangeColor: ColorResolvable = '#ffa200';

    // Misc
    public uuid: string = uuidv4();
    public sessionCounters = {
        commandsRan: 0,
        warningsLogged: 0,
        errorsLogged: 0
    };

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
        this.db = MySQLClient.getInstance(this);
        this.localizationManager = LocalizationManager.getInstance(this);
        this.configManager = ConfigManager.getInstance(this, this.db);

        // Initialize required services.
        await this.browserService.launchBrowser();
        await this.db.initializeSchema();

        Logger.init(this)

        this.locales = await this.localizationManager.loadLocales();

        Logger.debug('Logging into Discord...');
        await this.login(token);
    };
};