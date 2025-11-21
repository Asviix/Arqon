// src\Commands\Utility\help\command.ts

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { Command, CommandContext } from "@/Commands/BaseCommand";
import { HelpHandler } from "./services/helpHandler";
import { Logger } from "@/Utils/Logger";

export default class HelpCommand extends Command {
    public cooldown: number = 5;
    public category: string | null = 'Utility';

    public commandData = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show Arqon\'s help for a specific command.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(commandOption => commandOption
            .setName('command')
            .setDescription('The command you want help for.')
            .setRequired(true)
        ) as SlashCommandBuilder;

    public async execute (c: CommandContext) {
        const startTime = Date.now()

        const h = new HelpHandler(c);
        const msgPayload = await h.main();

        const endTime = Date.now();
        const duration = endTime - startTime;

        Logger.debug(`[EXECUTION TIME] /${this.commandData.name} took ${duration}ms.`)

        c.interaction.reply(msgPayload);
    };
};