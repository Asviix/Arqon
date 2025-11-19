// src\Commands\hltv\command.ts

import { InteractionContextType, InteractionReplyOptions, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { Command, CommandContext } from '@/Commands/BaseCommand';
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
                .addStringOption(gameVersionOption => gameVersionOption
                    .setName('game_version')
                    .setDescription('The version of Counter-Strike to get.')
                    .setRequired(false)
                    .addChoices(
                        {name: 'CS:GO', value: 'CSGO'},
                        {name: 'CS2', value: 'CS2'}
                    )
                )
                .addStringOption(matchTypeOption => matchTypeOption
                    .setName('match_type')
                    .setDescription('The type of matches to include.')
                    .setRequired(false)
                    .addChoices(
                        {name: 'Majors', value: 'Majors'},
                        {name: 'Big Events', value: 'BigEvents'},
                        {name: 'LAN', value: 'Lan'},
                        {name: 'Online', value: 'Online'}
                    )
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

        await c.interaction.deferReply({
            flags: MessageFlags.Ephemeral
        });

        let returnPayload: InteractionReplyOptions = {
            content: 'How did we get here ?'
        };

        const subCommandGroup = c.interaction.options.getSubcommandGroup();

        if (subCommandGroup) {
            const subCommand = c.interaction.options.getSubcommand();
            switch (subCommandGroup) {
                case 'player':
                    switch (subCommand) {
                        case 'stats':
                            const playerName = c.interaction.options.getString('name');
                            const gameVersion = c.interaction.options.getString('game_version');
                            const matchType = c.interaction.options.getString('match_type');
                            const mapInput = c.interaction.options.getString('maps');
                            returnPayload = await runMethod(c, subCommand, playerName, gameVersion, matchType, mapInput);
                    };
            };

        } else {
            const subCommand = c.interaction.options.getSubcommand();
            switch (subCommand) {
                case 'live':
                    returnPayload = await runMethod(c, subCommand);
            };
        };

        await c.interaction.followUp(returnPayload);
    };
};