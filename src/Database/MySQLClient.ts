// src\Database\MySQLClient.ts

import { Logger } from '../Utils/Logger';
import * as mysql from 'mysql2/promise';

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
    private pool: mysql.Pool;

    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
        Logger.success('Database pool created.');
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
        const MAX_RETRIES = 5;
        const TIMEOUT = 5000;
        let retries = 0;

        while (retries < MAX_RETRIES) {
            try {
                await this.query('SELECT 1 + 1 AS SOLUTION');

                const createTableSQL = `
                    CREATE TABLE IF NOT EXISTS guild_configs (
                        guild_id VARCHAR(20) PRIMARY KEY,
                        language_code VARCHAR(10) NOT NULL DEFAULT 'en-US',
                        joined_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                `;
                await this.query(createTableSQL);
                Logger.success('Database schema initialized.')
                return;

            } catch (error) {
                retries++;
                if (retries >= MAX_RETRIES) {
                    Logger.error('Failed to connect to the databse after multiple retires.');
                    throw error;
                };
            };

            await sleep(TIMEOUT)
        };
    };

    /**
     * Initializes the database for a newly joined guild.
     * @param guildId The ID of the guild to add.
     */
    public async initializeGuildConfig(guildId: string): Promise<void> {
        await this.setGuildLanguage(guildId, 'en-US');
    };

    /**
     * Retrieves the configuration for a specific guild.
     * @param guildId The ID of the guild to fetch.
     */
    public async getGuildConfig(guildId: string): Promise<GuildConfig | null> {

        const [rows] = await this.query<mysql.RowDataPacket[]>(
            'SELECT * FROM guild_configs WHERE guild_id = ?',
            [guildId]
        );
        
        if (!rows || rows.length === 0) {
            return null;
        };

        return rows as GuildConfig;
    };

    /**
     * Ensures a guild configuration exists in the database.
     * @param guildId The ID of the Guild to check.
     */
    public async ensureGuildConfig(guildId: string): Promise<void> {
        const config = await this.getGuildConfig(guildId);
        if (config === null) {
            await this.initializeGuildConfig(guildId);
        };
    };

    /**
     * Sets the language code for a guild (upsert).
     * @param guildId The ID of the guild to set.
     */
    public async setGuildLanguage(guildId: string, languageCode: string): Promise<void> {
        await this.query(
            `
            INSERT INTO guild_configs (guild_id, language_code)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE language_code = VALUES(language_code);
            `,
            [guildId, languageCode]
        );
    };
};