// src\Locales\interfaces.ts

export interface a_COOLDOWN {
    seconds: string,
    commandName: string
};

export interface a_COMMAND_PING_EMBED_FIELD_DESCRIPTION {
    wsping: string,
    apiLatency: string,
    uptime: string
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

export interface a_COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION {
    filters: string,
    mapCount: string
};

export interface a_COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_RATINGS_VALUE {
    ctRating: string,
    tRating: string,
    boxRatingType: string,
    boxRating: string
};

export interface a_COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_METRICS_VALUE {
    roundSwing: string,
    deathPerRound: string,
    kast: string,
    multikills: string,
    adr: string,
    kpr: string
};

export interface a_COMMAND_HTLV_PLAYER_STATS_EMBED_FIELD_ROLES_VALUE {
    firepowerRating: string,
    entryingRating: string,
    tradingRating: string,
    openingRating: string,
    clutchingRating: string,
    snipingRating: string,
    utilityRating: string
};