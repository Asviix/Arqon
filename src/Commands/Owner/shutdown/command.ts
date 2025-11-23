// src\Commands\owner\shutdownCommand\command.ts

import { SlashCommandBuilder, InteractionContextType } from 'discord.js';
import { Command, CommandContext } from "@/commands/baseCommand";
import { ShutdownHandler } from "./services/handler";

export default class ShutdownCommand extends Command {
    public cooldown: number = 0;
    public category: string | null = 'Owner';

    public commandData = new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shuts down the bot process.')
        .setContexts(InteractionContextType.Guild)
        .addBooleanOption(autoRestart => autoRestart
            .setName('auto_restart')
            .setDescription('If the bot should automatically restart after shutdown.')
            .setRequired(true)
        ) as SlashCommandBuilder;

    public async execute(c: CommandContext) {
        new ShutdownHandler(c);
    };
}