// src\Commands\hltv\command.ts

import { Command } from "../BaseCommand";
import { BotClient } from "../../Client/BotClient";
import { InteractionContextType, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { runMethod } from "./methods/manager";

export default class hltvCommand extends Command {
    public cooldown = 5;

    public commandData = new SlashCommandBuilder()
        .setName('hltv')
        .setDescription('Fetch a large amount of data from HLTV.org')
        .setContexts(InteractionContextType.Guild);
    
    public async execute(client: BotClient, interaction: ChatInputCommandInteraction, languageCode: string) {

        interaction.deferReply();
    
        const returnEmbed = await runMethod('live');

        interaction.followUp({
            embeds: [returnEmbed]
        });
    };
};