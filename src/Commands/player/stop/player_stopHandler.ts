// src\commands\player\stop\player_stopHandler.ts

import { CommandContext } from "@/commands/baseCommand";
import { BaseMessageOptions } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";
import * as dsp from 'discord-player';

export class player_stopHandler {
    private c: CommandContext

    constructor(c: CommandContext) {
        this.c = c;
    };

    public async main(): Promise<BaseMessageOptions> {
        let payload: BaseMessageOptions;

        if (!(this.c.interaction.guildId)) {
            return payload = {
                content: `Guild does not exist!`
            };
        };

        const connection = dsp.useMainPlayer();

        if (!connection) {
            return payload = {
                content: `Not currently in a voice channel!`
            };
        };

        connection.destroy();

        return payload = {
            content: `Successfully left voice channel!`
        };
    };

    public dispose(): void {
        (this.c as any) = null;
    };
};