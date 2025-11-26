// src\Locales\en-US.ts

import * as i from '../data/interfaces';

export const en = {
    // COMMONS
    BASE_ERROR_COMMAND_NOT_FOUND: `Error: Command not found.`,
    COOLDOWN: ({ seconds, commandName }: i.a_COOLDOWN) =>
        `You must wait ${seconds}s before using the \`/${commandName}\` command again.`,
    ERROR_GENERIC: `An unexpected error occurred. Please try again.`,

    //#region PING
    //#region COMMAND
    COMMAND_PING_ERROR_COMMAND_NO_EXIST: `❌ This command doesn't exist!`,
    COMMAND_PING_EMBED_TITLE: `🏓 Pong!`,
    COMMAND_PING_EMBED_FIELD_NAME: `**Statistics:**`,
    COMMAND_PING_EMBED_FIELD_VALUE: ({ wsping, apiLatency, uptime, memoryUsage, users }: i.a_COMMAND_PING_EMBED_FIELD_VALUE) =>
    `**Websocket Ping:** \`${wsping}ms\`
    **API Latency:** \`${apiLatency}ms\`
    **Memory Usage:** \`${memoryUsage}MB\`
    **Total Users:** \`${users}\`
    **Uptime:** \`${uptime}\``,
    //#endregion
    //#endregion

    //#region HLTV
    COMMAND_HLTV_NAVIG_FAIL_NO_RESPONSE: `Navigation failed: Received no HTTP response from HLTV.`,
    COMMAND_HLTV_NAVIG_FAIL_403: `HLTV Blocked the Request. (403 Forbidden)`,
    //#region PLAYER
    //#region STATS
    COMMAND_HLTV_PLAYER_STATS_INVALID_DATE_FORMAT: `Invalid date format or value. Please use YYYY-MM-DD.`,
    COMMAND_HLTV_PLAYER_STATS_SEARCH_NO_RESULT: `Your search returned no result.`,
    COMMAND_HLTV_PLAYER_STATS_MENU_NO_SELECTION: `No selection made in time.`,
    COMMAND_HLTV_PLAYER_STATS_MENU_NO_INTERACT: `Unknown interaction.`,
    COMMAND_HLTV_PLAYER_STATS_MENU_SELECT_RESULT: `You selected:`,
    //#endregion
    //#endregion
    //#endregion
};