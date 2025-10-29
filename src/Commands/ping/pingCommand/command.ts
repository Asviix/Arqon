// src\Commands\ping\pingCommand\command.ts

import { Command } from '../../BaseCommand';
import { BotClient } from '../../../Client/BotClient';
import { ChatInputCommandInteraction, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

export default class PingCommand extends Command {
    public cooldown = 5;

    public commandData = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! (and checks the latency).')
        .setContexts(InteractionContextType.Guild);

    /**
     * The main execution logic for the command.
     */
    public async execute(client: BotClient, interaction: ChatInputCommandInteraction, languageCode: string) {
        const sentTime = interaction.createdTimestamp;
        const latency = sentTime - Date.now();

        const responseText = await client.localizationManager.getString(languageCode, 'COMMAND_PING_RESPONSE',
            {
                'botLatency': latency.toString(),
                'apiLatency': client.ws.ping.toString()
            }
        );

        await interaction.reply({
            content: responseText,
            flags: MessageFlags.Ephemeral
        });
    };
};