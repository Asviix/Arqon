// src\Commands\hltv\subCommands\playerStats\services\interfaces.ts

export interface Stats {
    filters: string[],
    dateFilter: string[]
    statsUrl: string,
    attachementName: string;
    playerName: string,
    mapCount: string,
};