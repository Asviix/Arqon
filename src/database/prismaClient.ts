// src\database\prismaClient.ts

import * as dbE from '@/errors/databaseErrors';
import * as dbI from '@prisma/client';
import * as dbT from '@/types/dbTypes';
import { Logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_ROOT_USER,
    password: process.env.DB_ROOT_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

export async function initBotLogs(uuid: string): Promise<void> {
    try {
        await prisma.botLogs.create({
            data: {
                session_uid: uuid
            }
        });
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error('Error during bot logs initialization.', err);
    } finally {
        await prisma.$disconnect();
    };
};

export async function setGuildConfig(guildId: string): Promise<dbT.queryResult<dbI.GuildConfig>> {
    try {
        const newGuild = await prisma.guildConfig.create({
            data: {
                guild_id: guildId
            }
        });
        return { ok: true, value: newGuild};
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error('Error during guild config initialization.', err);
        return { ok: false, value: null, error: err};
    };
};

export async function getGuildConfig(guildId: string): Promise<dbT.queryResult<dbI.GuildConfig>> {
    try {
        const guild = await prisma.guildConfig.findUnique({
            where: {
                guild_id: guildId
            }
        });
        return { ok: true, value: guild};
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error(`Failed to get config for guild with ID ${guildId}`, err);
        return { ok: false, value: null, error: err};
    };
};

export async function setHLTVPlayer(data: dbI.HltvPlayer): Promise<dbT.queryResult<dbI.HltvPlayer>> {
    try {
        const player = await prisma.hltvPlayer.create({
            data: {
                player_id: data.player_id.toString(),
                first_name: data.first_name,
                last_name: data.last_name,
                nickname: data.nickname,
                country: data.country
            }
        });
        return { ok: true, value: player};
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error(`Failed to insert player in database.\nPlayer:\n${Array(data).join(',\n')}`);
        return { ok: false, value: null, error: err};
    };
};

export async function getHLTVPlayer(playNick: string): Promise<dbT.queryResult<dbI.HltvPlayer[]>> {
    try {
        const rows = await prisma.hltvPlayer.findMany({
            where: {
                nickname: {
                    contains: playNick
                }
            }
        });

        if (!rows) {
            throw new dbE.NoReturnError('Query returned no result.');
        };
        return { ok: true, value: rows as dbI.HltvPlayer[]};
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error(`Failed to get player ${playNick} from database.`, err);
        return { ok: false, value: null, error: err};
    };
};