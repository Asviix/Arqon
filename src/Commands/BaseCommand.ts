// src\Commands\BaseCommand.ts

import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    InteractionResponse,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

import { BotClient } from '@/Client/BotClient';
import { BoundTranslatorObject } from '@/Locales/TranslatorHelper';

export interface CommandContext {
    readonly client: BotClient,
    readonly interaction: ChatInputCommandInteraction,
    readonly languageCode: string,
    readonly _: BoundTranslatorObject;
};

/**
 * The base class for all application commands.
 */
export abstract class Command {
    public abstract cooldown: number;
    public abstract category: string | null;
    public abstract commandData: 
        SlashCommandBuilder | 
        SlashCommandSubcommandsOnlyBuilder | 
        Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

    /**
     * The method that runs when the command is executed by a user.
     * @param interaction The interaction object received from Discord.
     * @param client The custom BotClient instance.
     * @param languageCode The locale to use to return the command.
     * @returns A promise resolving to the interaction response.
     */
    public abstract execute(
        context: CommandContext
    ): Promise<void | InteractionResponse>;

    public get name(): string {
        return (this.commandData as SlashCommandBuilder).name || 'unknown'
    };
};