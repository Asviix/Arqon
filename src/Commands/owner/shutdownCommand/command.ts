// src\Commands\owner\shutdownCommand\command.ts

import { Logger } from "@/Utils/Logger";
import { Command, CommandContext } from "@/Commands/BaseCommand";
import { isOwner } from "@/Utils/Permissions";
import { SlashCommandBuilder, InteractionContextType, InteractionResponse, MessageFlags } from "discord.js";

export default class ShutdownCommand extends Command {
    public cooldown = 0;

    public commandData = new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shuts down the bot process.')
        .setContexts(InteractionContextType.Guild)

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