// src\Locales\interfaces.ts

import { LocalizationKeys } from "./keys";

export interface ParametrizedKeyMap {
    'COOLDOWN': a_COOLDOWN;
    'COMMAND_PING_EMBED_FIELD_VALUE': a_COMMAND_PING_EMBED_FIELD_VALUE
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

export type LocaleArgsMap = {
    [K in LocalizationKeys]: 
        K extends keyof ParametrizedKeyMap
            ? ParametrizedKeyMap[K]
            : void; 
};