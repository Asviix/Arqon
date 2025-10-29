// src\Client\BotClient.ts

import { Client, Collection, ClientOptions } from 'discord.js';
import { Command } from '../Commands/BaseCommand';
import { EventHandler } from '../Events/BaseEvent';
import { LocaleStrings, LocalizationManager } from '../Locales/LocalizationManager';
import { ConfigManager } from '../Managers/ConfigManager';
import { MySQLClient, GuildConfig } from '../Database/MySQLClient';

export class BotClient extends Client {

    // Interfaces
    public commands: Collection<string, Command> = new Collection();
    public eventFiles: Collection<string, EventHandler> = new Collection();
    public cooldowns: Collection<string, Collection<string, number>> = new Collection();
    public locales: LocaleStrings = {};
    public guildConfigs: Collection<string, GuildConfig> = new Collection();

    // Classes
    public db!: MySQLClient;
    public localizationManager: LocalizationManager
    public configManager!: ConfigManager;

    constructor(options: ClientOptions) {
        super(options);
        this.db = new MySQLClient();
        this.localizationManager = new LocalizationManager(this);
        this.configManager = new ConfigManager(this, this.db);
    };

    public async start(token: string) {
        await this.db.initializeSchema();

        this.locales = await this.localizationManager.loadLocales();

        await this.login(token);
    };
};