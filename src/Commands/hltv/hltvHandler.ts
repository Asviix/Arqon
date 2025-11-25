// src\commands\hltv\hltvHandler.ts

import { CommandContext } from "@/commands/baseCommand";
import { InteractionEditReplyOptions, MessageFlags } from "discord.js";
import { player_statsHandler } from "./player/stats/player_statsHandler";

export async function runMethod(c: CommandContext): Promise<InteractionEditReplyOptions> {
    const subCommandGroup = c.interaction.options.getSubcommandGroup(true);
    const subCommand = c.interaction.options.getSubcommand(true);

    let payload: InteractionEditReplyOptions = {
        content: `How did we get here?`
    };

    if (subCommandGroup === 'player') {
        if (subCommand === 'stats') {
            const h = new player_statsHandler(c);
            const ephemeral = c.interaction.options.getBoolean('ephemeral', true);

            await c.interaction.deferReply({
                flags: ephemeral ? MessageFlags.Ephemeral : undefined
            });
            payload = await h.main();
        };
    };

    return payload;
};