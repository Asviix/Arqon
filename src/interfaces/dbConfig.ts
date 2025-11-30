// src\interfaces\dbConfig.ts

export interface GuildConfig {
    guild_id: string;
    language_code: string;
    joined_on: number;
};

export interface BotLogs {
    session_uid: string;
    timestamp: Date;
    commands_ran: Number;
    warnings_logged: Number;
    errors_logged: Number;
};