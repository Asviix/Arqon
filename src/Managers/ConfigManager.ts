// src\Managers\ConfigManager.ts

import * as mysql from 'mysql2/promise'
import { BotClient } from "@/Client/BotClient";
import { GuildConfig, MySQLClient } from '@/Database/MySQLClient';
import { Logger } from "@/Utils/Logger";

/**
 * Manages the retrieval of guild-specific configurations,
 * including language codes and localized strings.
 */
export class ConfigManager {
    private static instance: ConfigManager;
    private client: BotClient;
    private db: MySQLClient;

    private constructor(client: BotClient, db: MySQLClient) {
        this.client = client;
        this.db = db
    };

    public static getInstance(client: BotClient, db: MySQLClient): ConfigManager {
        if (!ConfigManager.instance) {
            Logger.debug('Creating ConfigManager instance...');
            ConfigManager.instance = new ConfigManager(client, db);
        };
        return ConfigManager.instance;
    };

    /**
     * Initializes the database for a newly joined guild.
     * @param guildId The ID of the guild to add.
     * @returns A GuildConfig object.
     */
    public async initializeGuildConfig(guildId: string): Promise<GuildConfig> {
        await this.db.query(
            `INSERT INTO guild_configs (guild_id) VALUES (?)`, [guildId]
        )

        const newConfig: GuildConfig = {
            guild_id: guildId,
            language_code: 'en-US',
            joined_on: new Date().getTime()
        };

        return newConfig;
    };

    /**
     * Gets a guild config and initializes it if not present.
     * @param guildId The ID of the guild to get.
     * @returns A GuildConfig object.
     */
    public async getGuildConfig(guildId: string): Promise<GuildConfig> {
        const rows = await this.db.query<mysql.RowDataPacket[]>(
            `SELECT * FROM guild_configs WHERE guild_id = ?`,
            [guildId]
        );

        if (rows && rows.length > 0) {
            return rows[0] as GuildConfig;
        };

        try {
            return await this.initializeGuildConfig(guildId);
        } catch (error) {
            Logger.error('CRITICAL DB ERROR!', error);
            const newConfig: GuildConfig = {
                guild_id: guildId,
                language_code: 'en-US',
                joined_on: new Date().getTime()
            };

            return newConfig;
        };
    };

    /**
     * Gets the cached config of a specific guild and creates it if not there yet.
     * @param guildId The ID of the Guild.
     * @returns A GuildConfig object.
     */
    public async getCachedGuildConfig(guildId: string): Promise<GuildConfig> {
        const cachedConfig = this.client.guildConfigs.get(guildId);

        if (!cachedConfig) {
            const newConfig = await this.getGuildConfig(guildId);
            this.client.guildConfigs.set(guildId, newConfig);
            return newConfig;
        };

        return cachedConfig;
    };
};