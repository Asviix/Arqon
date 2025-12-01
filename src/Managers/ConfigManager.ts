// src\managers\configManager.ts

import { BotClient } from '@/client/botClient';
import * as db from '@/database/prismaClient';
import * as dbI from '@prisma/client';
import * as dbT from '@/types/dbTypes';
import { Logger } from '@/utils/logger';
import { Collection } from "discord.js";
import { CacheManager } from "./cacheManager";

interface DomainMap {
    botLogs: dbI.BotLogs;
    guildConfig: dbI.GuildConfig;
    hltvPlayer: dbI.HltvPlayer;
    hltvPlayers: dbI.HltvPlayer[];
};

export class ConfigManager {
    public static instance: ConfigManager;
    private client: BotClient;
    private cache: CacheManager;
    public caches = {
        guildConfigs: new Collection<string, dbI.GuildConfig>,
        hltvPlayersByNick: new Collection<string, string[]>,
        hltvPlayersByID: new Collection<string, dbI.HltvPlayer>
    };

    private constructor(client: BotClient) {
        this.client = client;
        this.cache = CacheManager.getInstance(this.caches);
    };

    public static getInstance(client: BotClient): ConfigManager {
        if (!ConfigManager.instance) {
            Logger.debug('Creating ConfigManager instance...');
            ConfigManager.instance = new ConfigManager(client);
        };
        return ConfigManager.instance;
    };

    public async get<K extends keyof DomainMap>(
        domain: K,
        id: string | number
    ): Promise<DomainMap[K] | null> {

        if (domain === 'guildConfig') {
            const guildId = String(id);

            const cached = this.cache.get('guildConfigs', guildId);
            if (cached) return cached as DomainMap[K];

            const dbRes: dbT.queryResult<dbI.GuildConfig> = await db.getGuildConfig(guildId);
            if (!dbRes.ok || !dbRes.value) return null;

            this.cache.set('guildConfigs', guildId, dbRes.value);
            return dbRes.value as DomainMap[K];
        };

        if (domain === 'hltvPlayers') {
            const nick = String(id).toLowerCase();

            const ids = this.cache.get('hltvPlayersByNick', nick);
            if (ids && ids.length > 0) {
                const players = ids
                    .map(id => this.cache.get('hltvPlayersByID', id))
                    .filter((p): p is dbI.HltvPlayer => p !== undefined);
                
                    if (players.length > 0) {
                        return players as DomainMap[K];
                    };
            };

            const dbRes: dbT.queryResult<dbI.HltvPlayer[]> = await db.getHLTVPlayer(nick);
            if (!dbRes.ok || !dbRes.value || dbRes.value.length === 0) {
                return null;
            };

            const playerIds = dbRes.value.map(p => {
                this.cache.set('hltvPlayersByID', p.player_id, p);
                return p.player_id;
            });

            this.cache.set('hltvPlayersByNick', nick, playerIds);

            return dbRes.value as DomainMap[K];
        };

        return null;
    };

    public async set<K extends keyof DomainMap>(
        domain: K,
        id: string,
        value?: DomainMap[K]
    ): Promise<DomainMap[K] | void> {

        if (domain === 'botLogs') {
            await db.initBotLogs(String(id));
            return;
        };
        
        if (domain === 'guildConfig') {
            const guild: dbT.queryResult<dbI.GuildConfig> = await db.setGuildConfig(id);
            this.cache.setGuildConfig(guild.value as never as dbI.GuildConfig);
            return guild.value as DomainMap[K];
        };

        if (domain === 'hltvPlayer') {
            const player: dbT.queryResult<dbI.HltvPlayer> = await db.setHLTVPlayer(value as never as dbI.HltvPlayer);
            this.cache.setHLTVPlayer(value as never as dbI.HltvPlayer);
            return player.value as DomainMap[K];
        };
    };
};