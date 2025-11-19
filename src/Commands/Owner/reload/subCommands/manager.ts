// src\Commands\Owner\reload\subCommands\manager.ts

import { InteractionReplyOptions, MessageFlags } from "discord.js";
import { CommandContext } from "@/Commands/BaseCommand";
import { Logger } from "@/Utils/Logger";
import { reloadCommand } from "./command/subCommand";

type ReloadMethod = (...args: any[]) => Promise<InteractionReplyOptions>;

const methodRegistry: Record<string, ReloadMethod> = {
    'command': reloadCommand
};

export function runMethod(c: CommandContext, method: string, ...args: any[]): Promise<InteractionReplyOptions> {
    const methodFunction = methodRegistry[method];

    if (!methodFunction) {
        const returnMessage: InteractionReplyOptions = {
            content: 'Invalid method!',
            flags: MessageFlags.Ephemeral
        };
        return Promise.resolve(returnMessage);
    };

    try {
        return methodFunction(c, ...args);
    } catch (error) {
        Logger.error(`Error executing Reload method "${method}":\n`, error);
        return Promise.reject(error);
    };
};