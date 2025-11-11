// src\Commands\hltv\command.ts

import { Command, CommandContext } from '../BaseCommand';
import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { runMethod } from "./methods/manager";

export default class hltvCommand extends Command {
    public cooldown = 5;

    public commandData = new SlashCommandBuilder()
        .setName('hltv')
        .setDescription('Fetch a large amount of data from HLTV.org')
        .setContexts(InteractionContextType.Guild);
    
    public async execute({client, interaction, languageCode}: CommandContext) {

        interaction.deferReply();
    
        const returnEmbed = await runMethod({client, interaction, languageCode}, 'live');

        interaction.followUp({
            embeds: [returnEmbed]
        });
    };
};