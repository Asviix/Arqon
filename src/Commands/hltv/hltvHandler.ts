// src\commands\hltv\hltvHandler.ts

import { InteractionReplyOptions, MessageFlags } from "discord.js";
import { CommandContext } from "@/commands/baseCommand";

export async function runMethod(c: CommandContext): Promise<InteractionReplyOptions> {
    const subCommandGroup = c.interaction.options.getSubcommandGroup(true);
    const subCommand = c.interaction.options.getSubcommand(true);

    let payload: InteractionReplyOptions = {
        content: `How did we get here?`,
        flags: MessageFlags.Ephemeral
    };

    if (subCommandGroup === 'player') {
        if (subCommand === 'stats') {
            //execute
        };
    };

    return payload;
};