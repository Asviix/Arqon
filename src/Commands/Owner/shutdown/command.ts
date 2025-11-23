// src\Commands\owner\shutdownCommand\command.ts

import { SlashCommandBuilder, InteractionContextType, InteractionResponse, MessageFlags } from "discord.js";
import { Command, CommandContext } from "@/commands/baseCommand";
import { isOwner } from "@/utils/permissions";
import { Logger } from "@/utils/logger";

export default class ShutdownCommand extends Command {
    public cooldown: number = 0;
    public category: string | null = 'Owner';

    public commandData = new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shuts down the bot process.')
        .setContexts(InteractionContextType.Guild) as SlashCommandBuilder;

    public async execute({client, interaction, languageCode}: CommandContext): Promise<void | InteractionResponse> {
        
        if (!isOwner(interaction.user.id)) {
            return interaction.reply('Tf are you trying to do?')
        };

        Logger.info(`Shutting down gracefully...\n- Ordered by ${interaction.user.displayName} (${interaction.user.id}) in ${interaction.guild!.name} (${interaction.guildId}) on ${new Date().toLocaleString('en-GB')}`);

        await interaction.reply({
            content: 'Shutting down...\n**NOTE: Will restart automatically if in production.**',
            flags: MessageFlags.Ephemeral
        });

        await client.db.syncSessionCounters();

        Logger.info(`Shutdown complete... Destroying app.`)

        client.destroy();
        process.exit(0);
    };
}