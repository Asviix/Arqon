// src\Client\BotClient.ts

import { Client, Collection, ClientOptions } from 'discord.js';
import { Command } from '../Commands/BaseCommand';
import { EventHandler } from '../Events/BaseEvent';
import { LocaleStrings, LocalizationManager } from '../Locales/LocalizationManager';
import { ConfigManager } from '../Managers/ConfigManager';
import { MySQLClient, GuildConfig } from '../Database/MySQLClient';
import { browserService } from '../Utils/BrowserService';
import { Logger } from '../Utils/Logger';
import { v4 as uuidv4 } from 'uuid';

export class BotClient extends Client {

    // Interfaces
    public commands: Collection<string, Command> = new Collection();
    public eventFiles: Collection<string, EventHandler> = new Collection();
    public cooldowns: Collection<string, Collection<string, number>> = new Collection();
    public locales: LocaleStrings = {};
    public guildConfigs: Collection<string, GuildConfig> = new Collection();
    public isProd: boolean = process.argv.includes('--env=production');

    // Classes
    public db: MySQLClient;
    public localizationManager: LocalizationManager;
    public configManager: ConfigManager;

    // Misc
    public uuid: string = uuidv4();
    public sessionCounters = {
        commandsRan: 0,
        warningsLogged: 0,
        errorsLogged: 0
    };

    constructor(options: ClientOptions) {
        super(options);
        this.db = new MySQLClient(this);
        this.localizationManager = new LocalizationManager(this);
        this.configManager = new ConfigManager(this, this.db);
    };

    public async start(token: string) {
        await this.db.initializeSchema();

        await browserService.launchBrowser();

        Logger.init(this)

        this.locales = await this.localizationManager.loadLocales();

        Logger.debug('Logging into Discord...');
        await this.login(token);
    };
};