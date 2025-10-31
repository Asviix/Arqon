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

        const pinging = await interaction.deferReply() // Defer reply

        const ws = interaction.client.ws.ping; // Websocket Ping
        const msgEdit = pinging.createdTimestamp - Date.now(); // API Latency

        // Uptime
        let days = Math.floor(interaction.client.uptime / 86400000);
        let hours = Math.floor(interaction.client.uptime / 3600000) % 24;
        let minutes = Math.floor(interaction.client.uptime / 60000) % 60;
        let seconds = Math.floor(interaction.client.uptime / 1000) % 60;

        await pinging.edit({
            content: await client.localizationManager.getString(languageCode, 'COMMAND_PING_RESPONSE', {
                'wsping': ws.toString(),
                'apiLatency': msgEdit.toString(),
                'days': days.toString(),
                'hours': hours.toString(),
                'minutes': minutes.toString(),
                'seconds': seconds.toString()
            })
        });
    };
};