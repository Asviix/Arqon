// src\commands\utility\command.ts

import { Command, CommandContext } from "@/commands/baseCommand";
import { InteractionContextType, InteractionReplyOptions, MessageEditOptions, SlashCommandBuilder } from 'discord.js';
import { runMethod } from "./utilityHandler";

export default class Utility extends Command {
    public cooldown: number = 5;
    public category: string | null = 'Utility';

    public commandData = new SlashCommandBuilder()
        .setName('utility')
        .setDescription('Utility commands.')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(pingCommand => pingCommand
            .setName('ping')
            .setDescription('Get runtime statistics.')
        ) as SlashCommandBuilder;

    public async execute (c: CommandContext) {
        const payload = await runMethod(c);

        if (c.interaction.deferred || c.interaction.replied) {
            await c.interaction.editReply(payload as MessageEditOptions);
        } else {
            await c.interaction.reply(payload as InteractionReplyOptions);
        };
    };
};