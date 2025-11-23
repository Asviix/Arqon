// src\Locales\en-US.ts

import * as i from '../data/interfaces';

export const en = {
    // COMMONS
    BASE_ERROR_COMMAND_NOT_FOUND: `Error: Command not found.`,
    COOLDOWN: ({ seconds, commandName }: i.a_COOLDOWN) =>
        `You must wait ${seconds}s before using the \`/${commandName}\` command again.`,
    ERROR_GENERIC: `An unexpected error occurred. Please try again.`,

    // PING
    // HELP
    COMMAND_PING_HELP_EMBED_TITLE: `ping`,
    COMMAND_PING_HELP_EMBED_FIELD1_NAME: `Description:`,
    COMMAND_PING_HELP_EMBED_FIELD1_VALUE: `Gets multiple runtime statistics:\n- The bot's latency\n- The bot's Uptime\n- The Discord API Latency.`,
    COMMAND_PING_HELP_EMBED_FIELD2_NAME: `Usage:`,
    COMMAND_PING_HELP_EMBED_FIELD2_VALUE: `\`/help <command>\`\n\n- Replace <command> with the command you help for.`,
    // COMMAND
    COMMAND_PING_ERROR_COMMAND_NO_EXIST: `❌ This command doesn't exist!`,
    COMMAND_PING_EMBED_TITLE: `🏓 Ping!`,
    COMMAND_PING_EMBED_FIELD_NAME: `**Statistics:**`,
    COMMAND_PING_EMBED_FIELD_VALUE: ({ wsping, apiLatency, uptime, memoryUsage, users }: i.a_COMMAND_PING_EMBED_FIELD_VALUE) =>
    `**- Websocket Ping:** \`${wsping}ms\`
    **- API Latency:** \`${apiLatency}ms\`
    **- Memory Usage:** \`${memoryUsage}MB\`
    **- Total Users:** \`${users}\`
    **- Uptime:** \`${uptime}\``,

    //HLTV
    //HLTV MANAGER
    COMMAND_HLTV_MANAGER_ERROR1_TITLE: `Command Error`,
    COMMAND_HLTV_MANAGER_ERROR1_DESCRIPTION: ({ method }: i.a_COMMAND_HLTV_MANAGER_ERROR1_DESCRIPTION) =>
        `The data source for /hltv ${method} is not available.`,

    //HLTV LIVE MATCHES
    COMMAND_HLTV_LIVE_MATCHES_EMBED_TITLE: `**LIVE HLTV MATCHES**`,
    COMMAND_HLTV_LIVE_MATCHES_EMBED_DESCRIPTION: ({ matches }: i.a_COMMAND_HLTV_LIVE_MATCHES_EMBED_DESCRIPTION) =>
        `Current tracking ${matches} active matches.`,
    COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_NAME: ({ meta, team1, team2 }: i.a_COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_NAME) =>
        `**[${meta}]** ${team1} vs ${team2}`,
    COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_VALUE: ({ event, currentScore1, currentScore2, mapScore1, mapScore2, matchLink }: i.a_COMMAND_HLTV_LIVE_MATCHES_EMBED_FIELDS_VALUE) =>
        `Event: **${event}**\nScore: \`${currentScore1} - ${currentScore2} (${mapScore1} - ${mapScore2})\`\n[🔗 Event Link](https://hltv.org${matchLink})`,

    //HLTV PLAYER STATS
    COMMAND_HTLV_PLAYER_STATS_INVALID_MAP_PARAMETERS_TITLE: `Invalid parameters!`,
    COMMAND_HTLV_PLAYER_STATS_INVALID_MAP_PARAMETERS_FIELD_NAME: `Make sure your map parameters follow this pattern:`,
    COMMAND_HTLV_PLAYER_STATS_INVALID_MAP_PARAMETERS_FIELD_VALUE: `\`map_1,map_2,map_3,etc...\`\nExample: \`de_ancient,de_mirage\``,
    COMMAND_HLTV_PLAYER_STATS_EMBED_DESCRIPTION_RANGE: ({ startDate, endDate }: i.a_COMMAND_HLTV_PLAYER_STATS_EMBED_DESCRIPTION_RANGE) =>
        `Range: **${startDate} - ${endDate}**`,
    COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION: ({ filters, mapCount }: i.a_COMMAND_HTLV_PLAYER_STATS_EMBED_DESCRIPTION) =>
        `Filters: **${filters}**\nStats over ${mapCount}`
};