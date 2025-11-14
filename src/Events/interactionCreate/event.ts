// src\Events\interactionCreate\event.ts

import { Logger } from "@/Utils/Logger";
import { BotClient } from "@/Client/BotClient";
import { EventHandler } from "@/Events/BaseEvent";
import { ChatInputCommandInteraction, Interaction, MessageFlags } from "discord.js";
import { interactionErrorReply, isCooldown} from "./methods";
import { CommandContext } from "@/Commands/BaseCommand";

export default class InteractionCreateEvent extends EventHandler {
    public name = 'interactionCreate';
    public once = false

    public async execute(client: BotClient, interaction: Interaction): Promise<void> {
        let responseText: string;

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

        const context: CommandContext = {
            client,
            interaction,
            languageCode
        }

        try {
            const [userInCooldown, remaining] = await isCooldown(client, interaction.user.id, command);

            if (userInCooldown) {
                responseText = await client.localizationManager.getString(languageCode, 'COOLDOWN', 
                    {
                        'seconds': remaining.toString(),
                        'commandName': command.name
                    }
                );

                return await interactionErrorReply(responseText, interaction);
            };
            client.sessionCounters.commandsRan += 1;

            await command.execute(context);
        } catch (error) {
            responseText = await client.localizationManager.getString(languageCode, 'ERROR_GENERIC');

            interactionErrorReply(responseText, interaction);

            Logger.error(`Error executing command /${interaction.commandName}:\n`, error);
        };
    };
};