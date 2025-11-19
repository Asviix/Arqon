// src\Client\BotClient.ts

import { Client, Collection, ClientOptions, ColorResolvable } from 'discord.js';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { browserService } from '@/Utils/BrowserService';
import { EventHandler } from '@/Events/BaseEvent';
import { ConfigManager } from '@/Managers/ConfigManager';
import { Command } from '@/Commands/BaseCommand';
import { LocaleStrings, LocalizationManager } from '@/Locales/LocalizationManager';
import { Logger } from '@/Utils/Logger';
import { MySQLClient, GuildConfig } from '@/Database/MySQLClient';

/**
 * The BotClient class that extends client.
 */
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

    // Colors
    public embedOrangeColor: ColorResolvable = '#ffa200';

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