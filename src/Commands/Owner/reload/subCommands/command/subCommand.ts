// src\Commands\Owner\reload\subCommands\command\subCommand.ts

import { InteractionReplyOptions, MessageFlags } from "discord.js";
import { CommandContext } from "@/commands/baseCommand";
import { reloadCommandMainEntry } from "./methods";

export async function reloadCommand(c: CommandContext, commandName: string, commandCategory: string | null): Promise<InteractionReplyOptions> {
    let returnMessage: InteractionReplyOptions;
    const success = await reloadCommandMainEntry(c, commandName, commandCategory);

    if (success) {
        return Promise.resolve(
            returnMessage = {
            content: `✅ Successfully reload command \`/${commandName}\` !`,
            flags: MessageFlags.Ephemeral
        });
    } else {
        return Promise.resolve(
            returnMessage = {
            content: `❌ Error in reloading command \`/${commandName}\` !`,
            flags: MessageFlags.Ephemeral
        });
    };
};