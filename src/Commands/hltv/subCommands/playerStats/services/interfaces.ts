// src\Commands\hltv\subCommands\playerStats\services\interfaces.ts

export interface Stats {
    filters: string[]
    statsUrl: string,
    playerName: string,
    playerImageURL: string,
    mapCount: string,
    tRating: string,
    ctRating: string,
    boxRating: string,
    boxRatingType: string,
    roundSwing: string,
    deathPerRound: string,
    kast: string,
    multiKill: string,
    adr: string,
    kpr: string,
    firepowerRating: string,
    entryingRating: string,
    tradingRating: string,
    openingRating: string,
    clutchingRating: string,
    snipingRating: string,
    utilityRating: string
};