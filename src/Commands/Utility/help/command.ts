// src\Commands\Utility\help\command.ts

import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { Command, CommandContext } from "@/Commands/BaseCommand";
import { HelpHandler } from "@help/services/handler";

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
        const h = new HelpHandler(c);

        await c.interaction.reply(await h.main());
        process.nextTick(() => h.dispose());
    };
};