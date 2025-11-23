//src/Commands/hltv/manager.ts

import { EmbedBuilder, InteractionReplyOptions } from "discord.js";
import { CommandContext } from '@/commands/baseCommand';
import { getLiveMatches } from "./subCommands/live/subCommand";
import { getPlayerStats } from "./subCommandGroups/player/subCommands/playerStats/subCommand";
import { Logger } from "@/utils/logger";

type HLTVMethod = (...args: any[]) => Promise<InteractionReplyOptions>;

const methodRegistry: Record<string, HLTVMethod> = {
    'live': getLiveMatches,
    'stats': getPlayerStats
};

export function runMethod(c: CommandContext, method: string, ...args: any[]): Promise<InteractionReplyOptions> {
    const _ = c._;
    const methodFunction = methodRegistry[method];

    if (!methodFunction) {
        const noMethodFunctionEmbed = new EmbedBuilder()
            .setTitle(_.COMMAND_HLTV_MANAGER_ERROR1_TITLE())
            .setDescription(_.COMMAND_HLTV_MANAGER_ERROR1_DESCRIPTION({
                method: method
            }))
            .setColor(c.client.embedOrangeColor);
        const returnPayload: InteractionReplyOptions = {
            embeds: [noMethodFunctionEmbed]
        }

        return Promise.resolve(returnPayload);
    };

    try {
        return methodFunction(c, ...args);
    } catch (error) {
        Logger.error(`Error executing HLTV method "${method}":\n`, error);
        return Promise.reject(error);
    };
};