// src\managers\cacheManager.ts

import { BotClient } from '@/client/botClient';
import { Logger } from '@/utils/logger';
import * as dbI from '@/interfaces/dbConfig';
import * as dbS from '@/interfaces/shared';
import * as caT from '@/types/cacheTypes';
import { ConfigManager } from './configManager';

export class CacheManager {
    private static instance: CacheManager;
    private config = ConfigManager.instance;

    private constructor() {};

    public static getInstance(client: BotClient): CacheManager {
        if (!CacheManager.instance) {
            if (!client) {
                throw new Error('CacheManager not initialized with BotClient.');
            };
            Logger.debug('Creating the cacheManager instance...');
            CacheManager.instance = new CacheManager();
        };
        return CacheManager.instance;
    };

    public get<K extends keyof ConfigManager['caches']>(
        cacheName: K,
        key: caT.CacheKey<K>
    ): ReturnType<ConfigManager['caches'][K]['get']> {
        return this.config.caches[cacheName].get(key as never) as caT.CacheReturn<K>;
    };

    public set<K extends keyof ConfigManager['caches']>(
        cacheName: K,
        key: caT.CacheKey<K>,
        value: caT.CacheValue<K>
    ): void {
        this.config.caches[cacheName].set(key as never, value as never);
    };

    public delete<K extends keyof ConfigManager['caches']>(
        cacheName: K,
        key: Parameters<ConfigManager['caches'][K]['delete']>[0]
    ): void {
        this.config.caches[cacheName].delete(key as never);
    };

    public setGuildConfig(guildConfig: dbI.GuildConfig): void {
        this.config.caches.guildConfigs.set(guildConfig.guild_id, guildConfig);
    };

    public getGuildConfig(guildId: string): dbI.GuildConfig | null {
        return this.config.caches.guildConfigs.get(guildId) ?? null;
    };

    public deleteGuildConfig(guildId: string): void {
        this.config.caches.guildConfigs.delete(guildId);
    };

    public setHLTVPlayer(data: dbS.HltvPlayer): void {
        const { player_id, nickname } = data;

        this.config.caches.hltvPlayersByID.set(player_id, data);

        const key = nickname.toLowerCase();
        const existingIds = this.config.caches.hltvPlayersByNick.get(key) ?? [];

        existingIds.push(player_id);
        this.config.caches.hltvPlayersByNick.set(key, existingIds);
    };

    public getHLTVPlayers(playerNick: string): dbS.HltvPlayer[] | null {
        const ids = this.config.caches.hltvPlayersByNick.get(playerNick.toLowerCase());

        if (!ids) {
            return null;
        };

        const players = ids
            .map(id => this.config.caches.hltvPlayersByID.get(id))
            .filter((p): p is dbS.HltvPlayer => p !== undefined);

        return players.length > 0 ? players : null;
    };

    public deleteHLTVPlayer(playerId: number): void {
        const player = this.config.caches.hltvPlayersByID.get(playerId);
        if (!player) return;

        this.config.caches.hltvPlayersByID.delete(playerId);

        const key = player.nickname.toLowerCase();
        const list = this.config.caches.hltvPlayersByNick.get(key);
        if (!list) return;

        const filtered = list.filter(id => id !== playerId);
        filtered.length
            ? this.config.caches.hltvPlayersByNick.set(key, filtered)
            : this.config.caches.hltvPlayersByNick.delete(key);
    };
};