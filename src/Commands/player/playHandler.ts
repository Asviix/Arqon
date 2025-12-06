// src\commands\player\playHandler.ts

import { CommandContext } from "@/commands/baseCommand";
import { BaseMessageOptions } from "discord.js";
import { player_playHandler } from "./play/player_playHandler";
import { player_stopHandler } from "./stop/player_stopHandler";

export async function runMethod(c: CommandContext): Promise<BaseMessageOptions> {
    const subCommand = c.interaction.options.getSubcommand(true);

    let payload: BaseMessageOptions = {
        content: `How did we get here?`
    };

    if (subCommand === 'play') {
        await c.interaction.deferReply();

        const h = new player_playHandler(c);
        
        payload = await h.main()

        process.nextTick(() => h.dispose());
    };

    if (subCommand === 'stop') {
        const h = new player_stopHandler(c);

        payload = await h.main();

        process.nextTick(() => h.dispose());
    };

    return payload;
};