// src\database\transaction.ts

import { MySQLClient } from '@/database/mySQLClient';
import * as dbE from '@/errors/databaseErrors';
import * as dbI from '@/interfaces/dbConfig';
import * as dbS from '@/interfaces/shared';
import * as dbT from '@/types/dbTypes';
import { Logger } from '@/utils/Logger';
import * as mysql from 'mysql2/promise';

const db = MySQLClient.getInstance();

export async function withTransaction<T>(fn: (db: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const conn = db.getConnection();

    try {
        (await conn).beginTransaction();
        const result = await fn(await conn)
        await (await conn).commit();
        return result;
    } catch (e) {
        const err = e instanceof Error ? e : new dbE.TransactionError(String(e));
        Logger.error(`Error during a transaction!`, err.message);
        await (await conn).rollback();
        throw err;
    } finally {
        (await conn).release();
    };
};

export async function initSchema(): Promise<void> {
    Logger.debug('Initializing Schema...')
    try {
        await withTransaction(async conn => {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS guild_configs (
                    guild_id VARCHAR(20) PRIMARY KEY,
                    language_code VARCHAR(10) NOT NULL DEFAULT 'en-US',
                    joined_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                );`
            );

            await conn.query(`
                CREATE TABLE IF NOT EXISTS hltv_players_database (
                    player_id VARCHAR(50) PRIMARY KEY,
                    first_name TINYTEXT,
                    last_name TINYTEXT,
                    nickname TINYTEXT,
                    country TINYTEXT
                );
            `)
        });
    } catch (e) {
        const err = e instanceof Error ? e : new dbE.TransactionError(String(e));
        Logger.error(`Error during Schema initialization!`, err.message);
    };
};

export async function initGuildConfig(guildId: string): Promise<dbT.queryResult<dbI.GuildConfig>> {
    try {
        const rows = await db.query<mysql.RowDataPacket[]>(`
            INSERT INTO guild_configs (guild_id)
            VALUES (?)
            RETURNING *;
        `, [guildId]
        );

        if (!rows.length) {
            throw new dbE.NoReturnError('Query returned no result.')
        };

        return { ok: true, value: rows[0] as dbI.GuildConfig};
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error('Error during guild config initialization.', err);
        return { ok: false, value: null, error: err };
    };
};

export async function getGuildConfig(guildId: string): Promise<dbT.queryResult<dbI.GuildConfig>> {
    try {
        const rows = await db.query<mysql.RowDataPacket[]>(`
            SELECT * FROM guild_configs
            WHERE guild_id = ?;
        `, [guildId]
        );

        if (!rows.length) {
            const newRows = await initGuildConfig(guildId);
            if (!newRows.ok) {
                throw new dbE.NoReturnError(`initGuildConfig() failed in getGuildConfig(): ${newRows.error ?? 'Unknown error'}`);
            };
            return { ok: true, value: newRows.value}
        };

        if (rows.length > 1) {
            throw new dbE.DuplicateKeyError('Query returned more than one result.');
        };

        return { ok: true, value: rows[0] as dbI.GuildConfig}
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error(`Failed to get config for guild ${guildId}`, err);
        return { ok: false, value: null, error: err};
    };
};

export async function insertPlayerinHLTVDatabase(data: dbS.HltvPlayer): Promise<dbT.queryResult<dbS.HltvPlayer>> {
    try {
        const rows = await db.query<mysql.RowDataPacket[]>(`
            INSERT INTO hltv_players_database
                (player_id, first_name, last_name, nickname, country)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (player_id) DO UPDATE
            RETURNING *;
        `, [data.player_id, data.first_name, data.last_name, data.nickname, data.country]
        );

        if (!rows.length) {
            throw new dbE.NoReturnError('Query returned no result.');
        };

        return { ok: true, value: rows[0] as dbS.HltvPlayer};
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error(`Failed to insert player in database.\nPlayer:\n${Array(data).join(',\n')}`, err);
        return { ok: false, value: null, error: err};
    };
};

export async function getHLTVPlayer(playerNick: string): Promise<dbT.queryResult<dbS.HltvPlayer[]>> {
    try {
        const rows = await db.query<mysql.RowDataPacket[]>(`
            SELECT * FROM hltv_players_database
            WHERE nickname LIKE ?`,
            [`%${playerNick}%`]
        );

        if (rows.length === 0) {
            throw new dbE.NoReturnError('Query returned no result.');
        };

        return { ok: true, value: rows as dbS.HltvPlayer[] };
    } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        Logger.error(`Failed to get player ${playerNick} from database.`, err);
        return { ok: false, value: null, error: err};
    };
};