// src\events\interactionCreate\event.ts

import { BotClient } from "@/client/botClient";
import { EventHandler } from "@/events/baseEvent";
import { Logger } from "@/utils/logger";
import { ChatInputCommandInteraction, Interaction, InteractionReplyOptions } from 'discord.js';
import { InteractionCreateHandler } from "./services/handler";

export default class InteractionCreateEvent extends EventHandler {
    public name = 'interactionCreate';
    public once = false

    public async execute(client: BotClient, interaction: Interaction): Promise<void> {
        /*
        if (interaction.isChatInputCommand() && interaction.command) {
            const test = interaction.command.options;
            test.forEach((option) => {
                console.log((option as ApplicationCommandSubCommand).options![0].name)           
            });
        };
        */
        // KEEP AS PROOF OF CONCEPT FOR HELP COMMAND HANDLING

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

        process.nextTick(() => h.dispose());
    };    

    private async interractionErrorReply(payload: InteractionReplyOptions, i: ChatInputCommandInteraction): Promise<void> {
        if (i.replied || i.deferred) {
            await i.followUp(payload);
        } else {
            await i.reply(payload);
        };
    };
};