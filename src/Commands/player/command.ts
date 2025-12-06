// src\commands\player\command.ts

import { Command, CommandContext } from "@/commands/baseCommand";
import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { runMethod } from "./playHandler";

export default class playerCommand extends Command {
    public cooldown: number = 5;
    public category: string | null = 'Player';

    public commandData = new SlashCommandBuilder()
        .setName('player')
        .setDescription('Commands related to the music player.')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(playCommand => playCommand
            .setName('play')
            .setDescription('Play a song.')
            .addStringOption(songOption => songOption
                .setName('song')
                .setDescription('The song to play.')
                .setRequired(true)
            )
        )
        .addSubcommand(stopCommand => stopCommand
            .setName('stop')
            .setDescription('Stop playing and leave the current voice channel clearing the queue.')
        )
    
    public async execute(c: CommandContext) {
        const payload = await runMethod(c);
        if (c.interaction.replied || c.interaction.deferred) {
            c.interaction.editReply(payload);
        } else {
            c.interaction.reply(payload);
        };
    };
};