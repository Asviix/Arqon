// src\Managers\ConfigManager.ts

import { BotClient } from "@/client/botClient";
import { MySQLClient } from '@/database/mySQLClient';
import { Logger } from "@/utils/logger";
import * as mysql from 'mysql2/promise';
import * as i from '@/config/interfaces'

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

    public async initializeGuildConfig(guildId: string): Promise<i.GuildConfig> {
        await this.db.query(
            `INSERT INTO guild_configs (guild_id) VALUES (?)`, [guildId]
        )

        const newConfig: i.GuildConfig = {
            guild_id: guildId,
            language_code: 'en-US',
            joined_on: new Date().getTime()
        };

        return newConfig;
    };

    public async getGuildConfig(guildId: string): Promise<i.GuildConfig> {
        const rows = await this.db.query<mysql.RowDataPacket[]>(
            `SELECT * FROM guild_configs WHERE guild_id = ?`,
            [guildId]
        );

        if (rows && rows.length > 0) {
            return rows[0] as i.GuildConfig;
        };

        try {
            return await this.initializeGuildConfig(guildId);
        } catch (error) {
            Logger.error('CRITICAL DB ERROR!', error);
            const newConfig: i.GuildConfig = {
                guild_id: guildId,
                language_code: 'en-US',
                joined_on: new Date().getTime()
            };

            return newConfig;
        };
    };

    public async getCachedGuildConfig(guildId: string): Promise<i.GuildConfig> {
        const cachedConfig = this.client.guildConfigs.get(guildId);

        if (!cachedConfig) {
            const newConfig = await this.getGuildConfig(guildId);
            this.client.guildConfigs.set(guildId, newConfig);
            return newConfig;
        };

        return cachedConfig;
    };

    public async insertPlayerinHLTVDatabase(data: i.HltvPlayer): Promise<void> {
        await this.db.query(
            `INSERT INTO hltv_players_database 
                (player_id, first_name, last_name, nickname, country)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                nickname = VALUES(nickname),
                country = VALUES(country)`,
            [data.player_id, data.first_name, data.last_name, data.nickname, data.country]
        );
    };

    public async getHLTVPlayer(playerNick: string): Promise<i.HltvPlayer[] | null> {
        const rows = await this.db.query<mysql.RowDataPacket[]>(
            `SELECT * FROM hltv_players_database WHERE nickname LIKE ?`,
            [`%${playerNick}%`]
        );

        if (rows && rows.length > 0) {
            return rows as i.HltvPlayer[];
        };

        for (const player of rows as i.HltvPlayer[]) {
            this.insertCachedHLTVPlayer(player);
        };

        return null;
    };

    private insertCachedHLTVPlayer(data: i.HltvPlayer): void {
        const { player_id, nickname } = data;

        this.client.hltvPlayerDBbyID.set(player_id, data);

        const exist = this.client.hltvPlayerDBbyNick.get(nickname.toLowerCase());
        if (exist) {
            exist.push(player_id);
        } else {
            this.client.hltvPlayerDBbyNick.set(nickname.toLowerCase(), [player_id]);
        };
    };

    public async getCachedHLTVPlayer(playerNick: string): Promise<i.HltvPlayer[] | null> {
        const ids = this.client.hltvPlayerDBbyNick.get(playerNick.toLowerCase());

        if (!ids) {
            return null;
        };

        const players = ids
            .map(id => this.client.hltvPlayerDBbyID.get(id))
            .filter((p): p is i.HltvPlayer => p !== undefined);

        return players.length > 0 ? players : null;
    };
};