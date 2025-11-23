// src\Events\interactionCreate\event.ts

import { ChatInputCommandInteraction, Interaction, InteractionReplyOptions } from 'discord.js';
import { BotClient } from "@/client/botClient";
import { EventHandler } from "@/events/baseEvent";
import { Logger } from "@/utils/logger";
import { InteractionCreateHandler } from "./services/handler";

export default class InteractionCreateEvent extends EventHandler {
    public name = 'interactionCreate';
    public once = false

    public async execute(client: BotClient, interaction: Interaction): Promise<void> {
        const VALID_MAPS: string[] = ['de_ancient', 'de_dust2', 'de_inferno', 'de_mirage', 'de_nuke', 'de_overpass', 'de_train', 'de_anubis', 'de_cache', 'de_cobblestone', 'de_season', 'de_tuscan', 'de_vertigo'];

        if (interaction.isAutocomplete()) {
            const focusedOption = interaction.options.getFocused(true);
            const commandName = interaction.commandName;

            if (focusedOption.name === 'maps' && commandName === 'hltv') {
                const fullInput = focusedOption.value;

                const parts = fullInput.split(',');
                const currentSearch = parts[parts.length - 1].trim().toLowerCase();

                const filtered = VALID_MAPS
                    .filter(map => map.toLowerCase().includes(currentSearch))
                    .slice(0, 25);

                await interaction.respond(
                    filtered.map(map => ({ name: map, value: map}))
                );
            } else if (focusedOption.name === 'command' && commandName === 'help') {
                const fullInput = focusedOption.value;

                const currentSearch = fullInput.trim().toLowerCase();

                const filtered = client.commands
                    .filter(command => command.name.toLowerCase().includes(currentSearch))
                    .map(command => ({ name: command.name, value: command.name}))
                    .slice(0, 25);

                await interaction.respond(
                    filtered
                );
            }
        };

        const h = new InteractionCreateHandler(client, interaction);

        const handlerResult = await h.main();

        if (!(interaction instanceof ChatInputCommandInteraction)) {
            return;
        };

        if (Array.isArray(handlerResult)) {
            const [command, c] = handlerResult;
            try {
                await command.execute(c);
            } catch (e) {
                await this.interractionErrorReply({
                    content: c._.ERROR_GENERIC(),
                    ephemeral: true
                }, interaction);
                return Logger.error(`Error executing command /${c.interaction.commandName}:\n`, e);
            };

        } else if (handlerResult) {
            await this.interractionErrorReply(handlerResult, interaction);
            return;
        };

        h.dispose();
    };    

    private async interractionErrorReply(payload: InteractionReplyOptions, i: ChatInputCommandInteraction): Promise<void> {
        if (i.replied || i.deferred) {
            await i.followUp(payload);
        } else {
            await i.reply(payload);
        };
    };
};