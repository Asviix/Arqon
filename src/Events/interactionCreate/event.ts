// src\Events\interactionCreate\event.ts

import { Logger } from "../../Utils/Logger";
import { BotClient } from "../../Client/BotClient";
import { EventHandler } from "../BaseEvent";
import { ChatInputCommandInteraction, Interaction, MessageFlags } from "discord.js";
import { interactionErrorReply, isCooldown} from "./methods";

export default class InteractionCreateEvent extends EventHandler {
    public name = 'interactionCreate';
    public once = false

    public async execute(client: BotClient, interaction: Interaction): Promise<void> {
        let responseText: string;

        try {
            client.db.ensureGuildConfig(interaction.guildId!);
        } catch (error) {
            Logger.error('DB FATAL ERROR:\n', error);
            return interactionErrorReply('[DATABASE INTERNAL ERROR]', interaction as ChatInputCommandInteraction);
        };

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            Logger.error(`Command not found: /${interaction.commandName}`);
            await interaction.reply(
                {
                    content: 'Error: Command not found.',
                    flags:MessageFlags.Ephemeral
                }
            );
            return;
        };

        const languageCode = (await client.configManager.getCachedGuildConfig(interaction.guildId!)).language_code;

        try {
            const [userInCooldown, remaining] = await isCooldown(interaction.user.id, command, client);

            if (userInCooldown) {
                responseText = await client.localizationManager.getString(languageCode, 'COOLDOWN', 
                    {
                        'seconds': remaining.toString(),
                        'commandName': command.name
                    }
                );

                return await interactionErrorReply(responseText, interaction);
            };

            await command.execute(client, interaction as ChatInputCommandInteraction, languageCode);
        } catch (error) {
            responseText = await client.localizationManager.getString(languageCode, 'ERROR_GENERIC')

            interactionErrorReply(responseText, interaction)

            Logger.error(`Error executing command /${interaction.commandName}:\n`, error);
        };
    };
};