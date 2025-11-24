// src\commands\utility\handler.ts

import { InteractionReplyOptions, MessageEditOptions, MessageFlags } from "discord.js";
import { CommandContext } from '@/commands/baseCommand';
import { PingHandler } from "./ping/pingHandler";

export async function runMethod(c: CommandContext): Promise<InteractionReplyOptions | MessageEditOptions> {
    const subCommand = c.interaction.options.getSubcommand(true);

    let payload: InteractionReplyOptions | MessageEditOptions = {
        content: `How did we get here?`,
        flags: MessageFlags.Ephemeral
    };

    if (subCommand === 'ping') {
        const pinging = await c.interaction.deferReply();
        const h = new PingHandler(c, pinging);
        payload = h.main();
        process.nextTick(() => h.dispose());
    };

    return payload;
};