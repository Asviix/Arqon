// src\Locales\en-US.ts

import * as i from '../data/interfaces';

export const en = {
    // COMMONS
    BASE_ERROR_COMMAND_NOT_FOUND: `Error: Command not found.`,
    COOLDOWN: ({ seconds, commandName }: i.a_COOLDOWN) =>
        `You must wait ${seconds}s before using the \`/${commandName}\` command again.`,
    ERROR_GENERIC: `An unexpected error occurred. Please try again.`,

    // PING
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
};