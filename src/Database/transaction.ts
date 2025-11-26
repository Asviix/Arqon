// src\database\transaction.ts

import { MySQLClient } from '@/database/mySQLClient'
import { Logger } from '@/utils/logger';
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
        await (await conn).rollback();
        Logger.error(`Error during a transaction!`, e);
        throw e;
    } finally {
        (await conn).release();
    };
};

export async function initSchema(uuid: string): Promise<void> {
    Logger.debug('Initializing Schema...')
    await withTransaction(async conn => {
        await conn.query(`
            CREATE TABLE IF NOT EXISTS guild_configs (
                guild_id VARCHAR(20) PRIMARY KEY,
                language_code VARCHAR(10) NOT NULL DEFAULT 'en-US',
                joined_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        `);

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
};