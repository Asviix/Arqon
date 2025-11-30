// src\database\prismaClient.ts

import * as dbE from '@/errors/databaseErrors';
import * as dbI from '@/interfaces/dbConfig';
import * as S from '@/interfaces/shared';
import * as dbT from '@/types/dbTypes';
import { Logger } from '@/utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    } finally {
        await prisma.$disconnect();
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
    } finally {
        await prisma.$disconnect();
    };
};

export async function setHLTVPlayer(data: S.HltvPlayer): Promise<dbT.queryResult<S.HltvPlayer>> {
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
    } finally {
        await prisma.$disconnect();
    };
};

export async function getHLTVPlayer(playNick: string): Promise<dbT.queryResult<S.HltvPlayer[]>> {
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
        return { ok: true, value: rows as S.HltvPlayer[]};
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error(`Failed to get player ${playNick} from database.`, err);
        return { ok: false, value: null, error: err};
    } finally {
        await prisma.$disconnect();
    };
};