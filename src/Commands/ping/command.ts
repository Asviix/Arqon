// src\Commands\ping\pingCommand\command.ts

import { Command, CommandContext } from '../BaseCommand'
import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { createPingEmbed } from './services/embedsGenerator';

export interface PingData {
    ws: number,
    apiLatency: number,
    uptime: string
};

export default class PingCommand extends Command {
    public cooldown = 5;

    public commandData = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! (and checks the latency).')
        .setContexts(InteractionContextType.Guild);

    /**
     * The main execution logic for the command.
     */
    public async execute({client, interaction, languageCode}: CommandContext) {

        const pinging = await interaction.deferReply() // Defer reply

        const ws = interaction.client.ws.ping; // Websocket Ping
        const apiLatency = pinging.createdTimestamp - Date.now(); // API Latency

        // Uptime
        let daysTemp = Math.floor(interaction.client.uptime / 86400000);
        let hoursTemp = Math.floor(interaction.client.uptime / 3600000) % 24;
        let minutesTemp = Math.floor(interaction.client.uptime / 60000) % 60;
        let secondsTemp = Math.floor(interaction.client.uptime / 1000) % 60;

        let days = daysTemp === 0 ? '' : daysTemp + 'd, ';
        let hours = hoursTemp === 0 ? '': hoursTemp + 'h, ';
        let minutes = minutesTemp === 0 ? '': minutesTemp + 'm, ';
        let seconds = secondsTemp === 0 ? '': secondsTemp + 's';

        let uptime = days + hours + minutes + seconds

        const returnEmbed = createPingEmbed({client, interaction, languageCode}, {ws, apiLatency, uptime})

        await pinging.edit({
            embeds: [returnEmbed]
        });
    };
};