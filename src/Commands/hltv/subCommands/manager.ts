// src\Commands\hltv\methods\manager.ts

import { EmbedBuilder } from "discord.js";
import { CommandContext } from '@/Commands/BaseCommand';
import { createTranslator } from "@/Locales/TranslatorHelper";
import { getLiveMatches } from "./live/methods/live";
import { getPlayerStats } from "./playerStats/methods/playerStats";
import { Logger } from "@/Utils/Logger";

type HLTVMethod = (...args: any[]) => Promise<EmbedBuilder>;

const methodRegistry: Record<string, HLTVMethod> = {
    'live': getLiveMatches,
    'stats': getPlayerStats
};

export function runMethod(context: CommandContext, method: string, ...args: any[]): Promise<EmbedBuilder> {
    const _ = createTranslator(context.client, context.languageCode)
    const methodFunction = methodRegistry[method];

    if (!methodFunction) {
        const title = _("COMMAND_HLTV_MANAGER_ERROR1_TITLE");
        const description = _("COMMAND_HLTV_MANAGER_ERROR1_DESCRIPTION", {
            method: method
        });

        return Promise.resolve(
            new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor('#ff0000')
        );
    };

    try {
        return methodFunction(context, ...args);
    } catch (error) {
        Logger.error(`Error executing HLTV method "${method}":\n`, error);
        return Promise.reject(error);
    };
};