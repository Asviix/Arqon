// src\config\interfaces.ts

export interface GuildConfig {
    guild_id: string;
    language_code: string;
    joined_on: number;
};

export interface HltvPlayer {
    player_id: number;
    first_name: string;
    last_name: string;
    nickname: string;
    country: string;
};