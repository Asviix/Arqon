// src\Commands\hltv\methods\manager.ts

import { EmbedBuilder } from "discord.js";
import { getLiveMatches } from "./live";
import { Logger } from "../../../Utils/Logger";

type HLTVMethod = (...args: any[]) => Promise<EmbedBuilder>;

const methodRegistry: Record<string, HLTVMethod> = {
    'live': getLiveMatches
};

export function runMethod(method: string, ...args: any[]): Promise<EmbedBuilder> {
    const methodFunction = methodRegistry[method];

    if (!methodFunction) {
        return Promise.resolve(
            new EmbedBuilder()
                .setTitle('Command Error')
                .setDescription(`The data source for /hltv ${method} is not available.`)
                .setColor('#ff0000')
        );
    };

    try {
        return methodFunction(...args);
    } catch (error) {
        Logger.error(`Error executing HLTV method "${method}":\n`, error);
        return Promise.reject(error);
    };
};