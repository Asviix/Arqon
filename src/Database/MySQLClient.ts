// src\Database\MySQLClient.ts

import * as mysql from 'mysql2/promise';
import { BotClient } from '@/client/botClient';
import { Logger } from '@/utils/logger';

/**
 * Sets a delay to sleep the function.
 * @param delay The delay in miliseconds.
 */
async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Interface for the Guild configuration data stored in the database.
 */
export interface GuildConfig {
    guild_id: string;
    language_code: string;
    joined_on: number;
};

export class MySQLClient {
    private static instance: MySQLClient
    private pool: mysql.Pool;
    private client: BotClient;

    private constructor(client: BotClient) {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        this.client = client;
        Logger.info('Database pool created.');
    };

    public static getInstance(client: BotClient): MySQLClient {
        if (!MySQLClient.instance) {
            Logger.debug('Creating MYSQLClient instance...')
            MySQLClient.instance = new MySQLClient(client);
        };
        return MySQLClient.instance;
    };

    /**
     * Executes a simple query.
     * @param sql The SQL query string.
     * @param values Values to escape into the query.
     */
    public async query<T extends mysql.RowDataPacket[] | mysql.ResultSetHeader | mysql.RowDataPacket[][]>(
        sql: string,
        values?: any[]
    ): Promise<T> {
        const [rows] = await this.pool.execute(sql, values);
        return rows as T;
    };

    /**
     * Initializes the necessary tables.
     */
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

                await this.query(`INSERT INTO bot_logs (session_uid) VALUES (?);`,
                    [this.client.uuid]
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

    public async syncSessionCounters(): Promise<void> {
        const { commandsRan, warningsLogged, errorsLogged } = this.client.sessionCounters;
        const sessionId = this.client.uuid;

        if (!sessionId || (commandsRan === 0 && warningsLogged === 0 && errorsLogged === 0)) {
            return;
        };

        try {
            await this.query(
                `UPDATE bot_logs SET commands_ran = commands_ran + ?, warnings_logged = warnings_logged + ?, errors_logged = errors_logged + ? WHERE session_uid = ?`,
                [commandsRan, warningsLogged, errorsLogged, sessionId]
            );

            this.client.sessionCounters.commandsRan = 0;
            this.client.sessionCounters.warningsLogged = 0;
            this.client.sessionCounters.errorsLogged = 0;

            Logger.debug('Session counters synced to database.');
        } catch (error) {
            Logger.error('Failed to sync session counters to DB!', error);
        };
    };
};