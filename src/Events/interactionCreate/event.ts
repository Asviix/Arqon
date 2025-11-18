// src\Events\interactionCreate\event.ts

import { Logger } from "@/Utils/Logger";
import { BotClient } from "@/Client/BotClient";
import { EventHandler } from "@/Events/BaseEvent";
import { Interaction, MessageFlags } from "discord.js";
import { interactionErrorReply, isCooldown} from "./methods";
import { CommandContext } from "@/Commands/BaseCommand";

export default class InteractionCreateEvent extends EventHandler {
    public name = 'interactionCreate';
    public once = false

    public async execute(client: BotClient, interaction: Interaction): Promise<void> {

        const languageCode = (await client.configManager.getCachedGuildConfig(interaction.guildId!)).language_code;

        const VALID_MAPS: string[] = ['de_ancient', 'de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_overpass', 'de_train', 'de_anubis', 'de_cache', 'de_cobblestone', 'de_season', 'de_tuscan', 'de_vertigo'];

        let responseText: string;

        if (interaction.isAutocomplete()) {
            const focusedOption = interaction.options.getFocused(true);

            if (focusedOption.name === 'maps') {
                const fullInput = focusedOption.value;

                const parts = fullInput.split(',');
                const currentSearch = parts[parts.length - 1].trim().toLowerCase();

                const filtered = VALID_MAPS
                    .filter(map => map.toLowerCase().includes(currentSearch))
                    .slice(0, 25);

                await interaction.respond(
                    filtered.map(map => ({ name: map, value: map}))
                );
            };
        };

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            Logger.error(`Command not found: /${interaction.commandName}`);
            await interaction.reply(
                {
                    content: client.localizationManager.getString(languageCode, 'BASE_ERROR_COMMAND_NOT_FOUND'),
                    flags:MessageFlags.Ephemeral
                }
            );
            return;
        };

        const context: CommandContext = {
            client,
            interaction,
            languageCode
        }

        try {
            const [userInCooldown, remaining] = await isCooldown(client, interaction.user.id, command);

            if (userInCooldown) {
                responseText = client.localizationManager.getString(languageCode, 'COOLDOWN', 
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
            responseText = client.localizationManager.getString(languageCode, 'ERROR_GENERIC');

            interactionErrorReply(responseText, interaction);

            Logger.error(`Error executing command /${interaction.commandName}:\n`, error);
        };
    };
};