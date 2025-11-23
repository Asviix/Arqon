// src\Locales\interfaces.ts

import { LocalizationKeys } from "./keys";

export interface ParametrizedKeyMap {
    'COOLDOWN': a_COOLDOWN;
    'COMMAND_PING_EMBED_FIELD_VALUE': a_COMMAND_PING_EMBED_FIELD_VALUE,
    'COMMAND_HLTV_MANAGER_ERROR1_DESCRIPTION': a_COMMAND_HLTV_MANAGER_ERROR1_DESCRIPTION,
    'COMMAND_HLTV_LIVE_MATCHES_EMBED_DESCRIPTION': a_COMMAND_HLTV_LIVE_MATCHES_EMBED_DESCRIPTION,
    'COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_NAME': a_COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_NAME,
    'COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_VALUE': a_COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_VALUE,
    'COMMAND_HLTV_PLAYER_STATS_EMBED_DESCRIPTION_RANGE': a_COMMAND_HLTV_PLAYER_STATS_EMBED_DESCRIPTION_RANGE,
    'COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION': a_COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION,
};

export interface a_COOLDOWN {
    seconds: string,
    commandName: string
};

export interface a_COMMAND_PING_EMBED_FIELD_VALUE {
    wsping: string,
    apiLatency: string,
    uptime: string,
    memoryUsage: string,
    users: string
};

export interface a_COMMAND_HLTV_MANAGER_ERROR1_DESCRIPTION {
    method: string
};

export interface a_COMMAND_HLTV_LIVE_MATCHES_EMBED_DESCRIPTION {
    matches: string
};

export interface a_COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_NAME {
    meta: string,
    team1: string,
    team2: string
};

export interface a_COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_VALUE {
    event: string,
    currentScore1: string,
    currentScore2: string,
    mapScore1: string,
    mapScore2: string,
    matchLink: string
};

export interface a_COMMAND_HLTV_PLAYER_STATS_EMBED_DESCRIPTION_RANGE {
    startDate: string,
    endDate: string
};

export interface a_COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION {
    filters: string,
    mapCount: string
};

export type LocaleArgsMap = {
    [K in LocalizationKeys]: 
        K extends keyof ParametrizedKeyMap
            ? ParametrizedKeyMap[K]
            : void; 
};