// src\commands\owner\ownerHandler.ts

import { CommandContext } from "@/commands/baseCommand";
import { ShutdownHandler } from "./shutdown/shutdownHandler";

export async function runMethod(c: CommandContext): Promise<void> {
    const subCommand = c.interaction.options.getSubcommand(true);

    if (subCommand === 'shutdown') {
        new ShutdownHandler(c)
    };
};