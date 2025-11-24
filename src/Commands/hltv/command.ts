// src\commands\hltv\command.ts

import { Command, CommandContext } from "@/commands/baseCommand";
import { InteractionContextType, SlashCommandBuilder } from "discord.js";

export default class hltvCommand extends Command {
    public cooldown: number = 5;
    public category: string | null = 'HLTV';

    public commandData = new SlashCommandBuilder()
        .setName('hltv')
        .setDescription('Command related to HLTV.')
        .setContexts(InteractionContextType.Guild)
        .addSubcommandGroup(playerGroup => playerGroup
            .setName('player')
            .setDescription('Player related commands.')
            .addSubcommand(playerStats => playerStats
                .setName('stats')
                .setDescription('Get a player\'s stats.')
                .addStringOption(playerName => playerName
                    .setName('name')
                    .setDescription('The name of the player.')
                    .setRequired(true)
                )
            )
        );
    
    public async execute(c: CommandContext) {
        
    }
};