// src\Commands\hltv\command.ts

import { Command, CommandContext } from '@/Commands/BaseCommand';
import { EmbedBuilder, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { runMethod } from "./methods/manager";

export default class hltvCommand extends Command {
    public cooldown = 5;

    public commandData = new SlashCommandBuilder()
        .setName('hltv')
        .setDescription('Fetch a large amount of data from HLTV.org')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(liveCommand => liveCommand
            .setName('live')
            .setDescription('Fetches all the live matches currently on HLTV.')
        )

        .addSubcommandGroup(playerCommandGroup => playerCommandGroup
            .setName('player')
            .setDescription('Gets information about a specific player')
            .addSubcommand(playerStatsCommand => playerStatsCommand
                .setName('stats')
                .setDescription('Gets the stats of a player.')
                .addStringOption(playerNameOption => playerNameOption
                    .setName('name')
                    .setDescription('The name of the player you want the stats of.')
                    .setRequired(true)
                )
            )
        )
    
    public async execute({client, interaction, languageCode}: CommandContext) {

        await interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        let returnEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle('Test1')
            .setDescription('Test2')
            .setColor('Aqua')

        const subCommandGroup = interaction.options.getSubcommandGroup();

        if (subCommandGroup) {
            const subCommand = interaction.options.getSubcommand();
            switch (subCommandGroup) {
                case 'player':
                    switch (subCommand) {
                        case 'stats':
                            const playerName = interaction.options.getString('name');
                            returnEmbed = await runMethod({client, interaction, languageCode}, subCommand, playerName);
                    };
            };

        } else {
            const subCommand = interaction.options.getSubcommand();
            switch (subCommand) {
                case 'live':
                    returnEmbed = await runMethod({client, interaction, languageCode}, subCommand);
            };
        };

        interaction.followUp({
            embeds: [returnEmbed]
        });
    };
};