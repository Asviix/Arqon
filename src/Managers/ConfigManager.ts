// src\Managers\ConfigManager.ts

import { BotClient } from "../Client/BotClient";
import { GuildConfig } from '../Database/MySQLClient';
import { MySQLClient } from "../Database/MySQLClient";

/**
 * Manages the retrieval of guild-specific configurations,
 * including language codes and localized strings.
 */
export class ConfigManager {
    private client: BotClient;
    private db: MySQLClient;

    constructor(client: BotClient, db: MySQLClient) {
        this.client = client;
        this.db = db
    };

    /**
     * Gets the config of a specific guild.
     * @param guildId The ID of the Guild.
     * @returns A GuildConfig object.
     */
    public async getCachedGuildConfig(guildId: string): Promise<GuildConfig> {
        const cachedConfig = this.client.guildConfigs.get(guildId);

        if (!cachedConfig) {
            const newConfig = await this.db.initializeGuildConfig(guildId);
            this.client.guildConfigs.set(guildId, newConfig);
            return newConfig;
        };

        return cachedConfig;
    };
};