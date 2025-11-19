// src\Commands\reloadCommand\command.ts

import * as path from 'path';
import { InteractionContextType, MessageFlags, SlashCommandBuilder } from "discord.js";
import { Command, CommandContext } from "@/Commands/BaseCommand";
import { isOwner } from "@/Utils/Permissions";
import { Logger } from "@/Utils/Logger";
import { getCommandFilePath, reloadModule } from "./services/reloadModule";

export default class ReloadCommand extends Command {
    public cooldown: number = 0;
    public category: string | null = "Owner";

    public commandData = new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads a given command.')
        .setContexts(InteractionContextType.Guild)
        .addStringOption(commandOption => commandOption
            .setName('command')
            .setDescription('The command to reload.')
            .setRequired(true)
        ) as SlashCommandBuilder

    public async execute(c: CommandContext) {
        
        if (!isOwner(c.interaction.user.id)) {
            return c.interaction.reply('Tf are you trying to do?')
        };

        const commandName = c.interaction.options.getString('command');
        const commandCategory = c.client.commands.get(commandName as string)?.category;

        try {
            const filePath = getCommandFilePath(commandName as string, commandCategory as string | null, __dirname);

            const reloadedModule = reloadModule(filePath);

            const NewCommandClass = reloadedModule.default || reloadedModule[commandName as string];
            const newCommandInstance = new NewCommandClass(c.client);

            c.client.commands.set(commandName as string, newCommandInstance);

            await c.interaction.reply({
                content: `✅ Command \`${commandName}\` reloaded successfully !`,
                flags: MessageFlags.Ephemeral
            });
        } catch (error) {
            Logger.error(`Failed to reload command /${commandName}.\n`, error);
            await c.interaction.reply({
                content: `❌ Failed to reload command \`${commandName}\``,
                flags: MessageFlags.Ephemeral
            });
        };
    };
};