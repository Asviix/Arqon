// src\commands\owner\command.ts

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { Command, CommandContext } from "@/commands/baseCommand";
import { runMethod } from "./ownerHandler";

export default class Owner extends Command {
    public cooldown: number = 0;
    public category: string | null = 'Owner';

    public commandData = new SlashCommandBuilder()
        .setName('owner')
        .setDescription('Owner commands.')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(shutdownCommand => shutdownCommand
            .setName('shutdown')
            .setDescription('Shuts down the bot process.')
            .addBooleanOption(autoRestart => autoRestart
                .setName('auto_restart')
                .setDescription('If the bot should automatically restart after shutdown.')
                .setRequired(true)
            )
        ) as SlashCommandBuilder;

    public async execute(c: CommandContext) {
        runMethod(c);
    };
};