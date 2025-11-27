// src\Managers\ConfigManager.ts

import { BotClient } from "@/client/botClient";
import { MySQLClient } from '@/database/mySQLClient';
import { Logger } from "@/utils/Logger";
import * as dbI from '@/interfaces/dbConfig';
import * as dbS from '@/interfaces/shared';
import * as db from '@/database/transactions';

type Domain = 
    | 'guildConfig'
    | 'hltvPlayer'

interface DomainMap {
    guildConfig: dbI.GuildConfig;
    hltvPlayer: dbS.HltvPlayer;
};

export class ConfigManager {
    private static instance: ConfigManager;
    private client: BotClient;
    private db: MySQLClient;

    private constructor(client: BotClient, db: MySQLClient) {
        this.client = client;
        this.db = db;
    };

    public static getInstance(client: BotClient, db: MySQLClient): ConfigManager {
        if (!ConfigManager.instance) {
            Logger.debug('Creating ConfigManager instance...');
            ConfigManager.instance = new ConfigManager(client, db);
        };
        return ConfigManager.instance;
    };
};