// src\managers\cacheManager.ts

import { BotClient } from '@/client/botClient';
import { Logger } from '@/utils/Logger';
import * as dbI from '@/interfaces/dbConfig';
import * as dbS from '@/interfaces/shared';

export class CacheManager {
    private static instance: CacheManager;
    private client: BotClient;

    private constructor(client: BotClient) {
        this.client = client;
    };

    public static getInstance(client: BotClient): CacheManager {
        if (!CacheManager.instance) {
            Logger.debug('Creating the cacheManager instance...');
            CacheManager.instance = new CacheManager(client);
        };
        return CacheManager.instance;
    };

    public setGuildConfig(guildConfig: dbI.GuildConfig): void {
        this.client.guildConfigsCache.set(guildConfig.guild_id, guildConfig);
    };

    public getGuildConfig(guildId: string): dbI.GuildConfig | null {
        const config = this.client.guildConfigsCache.get(guildId);

        if (!config) {
            return null
        };

        return config;
    };

    public deleteGuildConfig(guildId: string): void {
        this.client.guildConfigsCache.delete(guildId);
    };

    public setHLTVPlayerNick(data: dbS.HltvPlayer): void {
        const { player_id, nickname } = data;

        this.client.hltvPlayersCacheID.set(player_id, data);

        const exist = this.client.hltvPlayersCacheNick.get(nickname.toLowerCase());
        if (exist) {
            exist.push(player_id);
        } else {
            this.client.hltvPlayersCacheNick.set(nickname.toLowerCase(), [player_id]);
        };
    };

    public getHLTVPlayers(playerNick: string): dbS.HltvPlayer[] | null {
        const ids = this.client.hltvPlayersCacheNick.get(playerNick.toLowerCase());

        if (!ids) {
            return null;
        };

        const players = ids
            .map(id => this.client.hltvPlayersCacheID.get(id))
            .filter((p): p is dbS.HltvPlayer => p !== undefined);

        return players.length > 0 ? players : null;
    };
};