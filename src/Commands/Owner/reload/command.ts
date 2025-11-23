// src\Commands\reloadCommand\command.ts

import { InteractionContextType, InteractionReplyOptions, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command, CommandContext } from "@/commands/baseCommand";
import { isOwner } from "@/utils/permissions";
import { runMethod } from './subCommands/manager';

export default class ReloadCommand extends Command {
    public cooldown: number = 0;
    public category: string | null = "Owner";

    public commandData = new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a given command.')
        .setContexts(InteractionContextType.Guild)
        .addSubcommand(reloadCommandCommand => reloadCommandCommand
            .setName('command')
            .setDescription('Reloads a command.')
            .addStringOption(commandStringOption => commandStringOption
                .setName('name')
                .setDescription('The name of the command to reload.')
                .setRequired(true)
            )
        ) as SlashCommandBuilder;

    public async execute(c: CommandContext) {
        
        if (!isOwner(c.interaction.user.id)) {
            return c.interaction.reply('Tf are you trying to do?')
        };

        const subCommand = c.interaction.options.getSubcommand();
        if (subCommand === 'command') {
            const commandName = c.interaction.options.getString('name');
            const commandCategory = c.client.commands.get(commandName as string)?.category;

            const returnPayload: InteractionReplyOptions = await runMethod(
                c,
                subCommand,
                commandName,
                commandCategory
            );

            await c.interaction.reply(returnPayload);
        } else {
            await c.interaction.reply({ content: 'How did we get here ?' });
        };
    };
};