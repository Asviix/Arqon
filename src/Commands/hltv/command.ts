// src\Commands\hltv\command.ts

import { InteractionContextType, InteractionReplyOptions, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { Command, CommandContext } from '@/commands/baseCommand';
import { runMethod } from "./manager";

export default class HLTVCommand extends Command {
    public cooldown: number = 5;
    public category: string | null = null

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
                .addBooleanOption(ephemeral => ephemeral
                    .setName('ephemeral')
                    .setDescription('Whether you want to share it to the world! (Or not, we don\'t judge.')
                    .setRequired(true)
                )
                .addStringOption(gameVersionOption => gameVersionOption
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
                .addStringOption(mapOption => mapOption
                    .setName('maps')
                    .setDescription('Specifiy map(s) to retrieve the specific stats of')
                    .setRequired(false)
                    .setAutocomplete(true)
                )
            )
        ) as SlashCommandBuilder;
    
    public async execute(c: CommandContext) {

        let returnPayload: InteractionReplyOptions = {
            content: 'How did we get here ?'
        };

        const subCommandGroup = c.interaction.options.getSubcommandGroup();
        const subCommand = c.interaction.options.getSubcommand();

        if (subCommand === 'live') {
            await c.interaction.deferReply();
            returnPayload = await runMethod(c, subCommand);
        };

        if (subCommandGroup) {
            if (subCommandGroup === 'player') {
                if (subCommand === 'stats') {
                    const playerName = c.interaction.options.getString('name');
                    const gameVersion = c.interaction.options.getString('game_version');
                    const startDate = c.interaction.options.getString('start_date');
                    const endDate = c.interaction.options.getString('end_date');
                    const mapInput = c.interaction.options.getString('maps');
                    const ephemeral = c.interaction.options.getBoolean('ephemeral');
                    if (ephemeral) {
                        await c.interaction.deferReply({
                            flags: MessageFlags.Ephemeral
                        });
                    } else {
                        await c.interaction.deferReply();
                    };
                    returnPayload = await runMethod(c, subCommand, playerName, gameVersion, startDate, endDate, mapInput);
                }
            }

        };

        await c.interaction.followUp(returnPayload);
    };
};