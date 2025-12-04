// src\commands\hltv\command.ts

import { Command, CommandContext } from "@/commands/baseCommand";
import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { runMethod } from "./hltvHandler";

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
                .addBooleanOption(ephemeral => ephemeral
                    .setName('ephemeral')
                    .setDescription('Whether the message should be ephemeral.')
                    .setRequired(true)
                )
                .addStringOption(playerName => playerName
                    .setName('name')
                    .setDescription('The name of the player.')
                    .setRequired(true)
                ).addStringOption(gameVersionOption => gameVersionOption
                    .setName('game_version')
                    .setDescription('The version of Counter-Strike to get.')
                    .setRequired(false)
                    .addChoices(
                        {name: 'CS:GO', value: 'CSGO'},
                        {name: 'CS2', value: 'CS2'}
                    )
                )
                .addStringOption(startDateOption => startDateOption
                    .setName('start_date')
                    .setDescription('Custom start date (YYYY-MM-DD). Requires end_date.')
                    .setRequired(false)
                )
                .addStringOption(endDateOption => endDateOption
                    .setName('end_date')
                    .setDescription('Custom end date (YYYY-MM-DD). Required start_date.')
                    .setRequired(false)
                )
            )
        ) as SlashCommandBuilder
    
    public async execute(c: CommandContext) {
      const payload = await runMethod(c);
      if (c.interaction.replied || c.interaction.deferred) {
        await c.interaction.editReply(payload);
      } else {
        await c.interaction.reply(payload);
      };
    };
};