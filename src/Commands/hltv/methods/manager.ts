// src\Commands\hltv\methods\manager.ts

import { EmbedBuilder } from "discord.js";
import { getLiveMatches } from "./live";
import { Logger } from "../../../Utils/Logger";
import { CommandContext } from '../../BaseCommand';

type HLTVMethod = (...args: any[]) => Promise<EmbedBuilder>;

const methodRegistry: Record<string, HLTVMethod> = {
    'live': getLiveMatches
};

export function runMethod(context: CommandContext, method: string, ...args: any[]): Promise<EmbedBuilder> {
    const methodFunction = methodRegistry[method];

    if (!methodFunction) {
        const title = context.client.localizationManager.getString(context.languageCode, "COMMAND_HLTV_MANAGER_ERROR1_TITLE");
        const description = context.client.localizationManager.getString(context.languageCode, "COMMAND_HLTV_MANAGER_ERROR1_DESCRIPTION", {
            method: method
        })

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