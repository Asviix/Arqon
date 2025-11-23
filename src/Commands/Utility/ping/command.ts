// src\Commands\Utility\ping\command.ts

import { InteractionContextType, SlashCommandBuilder } from 'discord.js';
import { Command, CommandContext } from '@/commands/baseCommand'
import { PingHandler } from './services/handler';

export default class PingCommand extends Command {
    public cooldown: number = 5;
    public category: string | null = 'Utility';

    public commandData = new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! (and checks the latency).')
        .setContexts(InteractionContextType.Guild) as SlashCommandBuilder;

    public async execute(c: CommandContext) {

        const pinging = await c.interaction.deferReply() // Defer reply

        const h = new PingHandler(c, pinging);
        const payload = h.main();

        pinging.edit(payload);
        process.nextTick(() => h.dispose());
    };
};