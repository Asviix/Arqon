// src\managers\cacheManager.ts

import { Logger } from '@/utils/logger';
import * as dbI from '@prisma/client';
import * as caT from '@/types/cacheTypes';
import { ConfigManager } from './configManager';

export class CacheManager {
    private static instance: CacheManager;
    private caches: ConfigManager['caches']

    private constructor(caches: ConfigManager['caches']) {
        this.caches = caches
    };

    public static getInstance(caches: ConfigManager['caches']): CacheManager {
        if (!CacheManager.instance) {
            Logger.debug('Creating the cacheManager instance...');
            CacheManager.instance = new CacheManager(caches);
        };
        return CacheManager.instance;
    };

    public get<K extends keyof ConfigManager['caches']>(
        cacheName: K,
        key: caT.CacheKey<K>
    ): ReturnType<ConfigManager['caches'][K]['get']> {
        return this.caches[cacheName].get(key as never) as caT.CacheReturn<K>;
    };

    public set<K extends keyof ConfigManager['caches']>(
        cacheName: K,
        key: caT.CacheKey<K>,
        value: caT.CacheValue<K>
    ): void {
        this.caches[cacheName].set(key as never, value as never);
    };

    public delete<K extends keyof ConfigManager['caches']>(
        cacheName: K,
        key: Parameters<ConfigManager['caches'][K]['delete']>[0]
    ): void {
        this.caches[cacheName].delete(key as never);
    };

    public setGuildConfig(guildConfig: dbI.GuildConfig): void {
        this.caches.guildConfigs.set(guildConfig.guild_id, guildConfig);
    };

    public getGuildConfig(guildId: string): dbI.GuildConfig | null {
        return this.caches.guildConfigs.get(guildId) ?? null;
    };

    public deleteGuildConfig(guildId: string): void {
        this.caches.guildConfigs.delete(guildId);
    };

    public setHLTVPlayer(data: dbI.HltvPlayer): void {
        const { player_id, nickname } = data;

        if (!nickname) return;

        this.caches.hltvPlayersByID.set(player_id, data);

        const key = nickname.toLowerCase();
        const existingIds = this.caches.hltvPlayersByNick.get(key) ?? [];

        existingIds.push(player_id);
        this.caches.hltvPlayersByNick.set(key, existingIds);
    };

    public getHLTVPlayers(playerNick: string): dbI.HltvPlayer[] | null {
        const ids = this.caches.hltvPlayersByNick.get(playerNick.toLowerCase());

        if (!ids) {
            return null;
        };

        const players = ids
            .map(id => this.caches.hltvPlayersByID.get(id))
            .filter((p): p is dbI.HltvPlayer => p !== undefined);

        return players.length > 0 ? players : null;
    };

    public deleteHLTVPlayer(playerId: string): void {
        const player = this.caches.hltvPlayersByID.get(playerId);
        if (!player || !player.nickname) return;

        this.caches.hltvPlayersByID.delete(playerId);

        const key = player.nickname.toLowerCase();
        const list = this.caches.hltvPlayersByNick.get(key);
        if (!list) return;

        const filtered = list.filter(id => id !== playerId);
        filtered.length
            ? this.caches.hltvPlayersByNick.set(key, filtered)
            : this.caches.hltvPlayersByNick.delete(key);
    };
};