// src\Database\MySQLClient.ts

import * as mysql from 'mysql2/promise';
import { BotClient } from '@/client/botClient';
import { Logger } from '@/utils/logger';
import { GuildConfig } from '@/config/interfaces';
import { HltvPlayer } from '@/config/interfaces';

async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export class MySQLClient {
    private static instance: MySQLClient
    private pool: mysql.Pool;

    private constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        Logger.info('Database pool created.');
    };

    public static getInstance(): MySQLClient {
        if (!MySQLClient.instance) {
            Logger.debug('Creating MYSQLClient instance...')
            MySQLClient.instance = new MySQLClient();
        };
        return MySQLClient.instance;
    };

    public async query<T extends mysql.RowDataPacket[] | mysql.ResultSetHeader | mysql.RowDataPacket[][]>(
        sql: string,
        values?: any[]
    ): Promise<T> {
        const [rows] = await this.pool.execute(sql, values);
        return rows as T;
    };

    public async getConnection(): Promise<mysql.PoolConnection> {
        return this.pool.getConnection();
    };

    public async initializeSchema(): Promise<void> {
        Logger.debug('Initializing Schema...');
        const MAX_RETRIES = 5;
        const TIMEOUT = 5000;
        let retries = 0;

        while (retries < MAX_RETRIES) {
            try {
                await this.query('SELECT 1 + 1 AS SOLUTION');

                const createGuildConfigsTable = `
                    CREATE TABLE IF NOT EXISTS guild_configs (
                        guild_id VARCHAR(20) PRIMARY KEY,
                        language_code VARCHAR(10) NOT NULL DEFAULT 'en-US',
                        joined_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                `;
                Logger.debug('Creating guild_configs table...');
                await this.query(createGuildConfigsTable);

                const createBotLogsTable = `
                    CREATE TABLE IF NOT EXISTS bot_logs (
                        session_uid CHAR(36) PRIMARY KEY,
                        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        commands_ran SMALLINT NOT NULL DEFAULT 0,
                        warnings_logged SMALLINT NOT NULL DEFAULT 0,
                        errors_logged SMALLINT NOT NULL DEFAULT 0
                    );
                `;
                Logger.debug('Creating the bot_logs table...');
                await this.query(createBotLogsTable);

                const createHltvPlayerDatabase = `
                    CREATE TABLE IF NOT EXISTS hltv_players_database (
                        player_id VARCHAR(50) PRIMARY KEY,
                        first_name TINYTEXT,
                        last_name TINYTEXT,
                        nickname TINYTEXT,
                        country TINYTEXT
                    );
                `;
                Logger.debug('Creating the hltv_players_database table...');
                await this.query(createHltvPlayerDatabase);

                await this.query(`INSERT INTO bot_logs (session_uid) VALUES (?);`,
                    ['test']
                );

                Logger.success('Database schema initialized!')
                return;

            } catch (error) {
                retries++;
                if (retries >= MAX_RETRIES) {
                    Logger.error('Failed to connect to the databse after multiple retires.');
                    throw error;
                };
            };

            await sleep(TIMEOUT);
        };
    };
};