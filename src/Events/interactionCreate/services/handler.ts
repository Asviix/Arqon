// src\events\interactionCreate\services\handler.ts

import { ChatInputCommandInteraction, Collection, Interaction, InteractionReplyOptions } from "discord.js";
import { BotClient } from "@/client/botClient";
import { BoundTranslatorObject, createTranslator } from "@/utils/translatorHelper";
import { Command, CommandContext } from "@/commands/baseCommand";
import { DEFAULT_LOCALE } from "@/managers/localizationManager";
import { Logger } from "@/utils/logger";

export class InteractionCreateHandler {
    private c: BotClient;
    private i: Interaction;

    constructor(c: BotClient, i: Interaction) {
        this.c = c;
        this.i = i;
    };

    public async main(): Promise<InteractionReplyOptions | [Command, CommandContext] | void> {
        if (!(this.i instanceof ChatInputCommandInteraction)) {
            return;
        };

        let i: ChatInputCommandInteraction = this.i;


        let languageCode: string = DEFAULT_LOCALE;

        if (typeof this.i.guildId === 'string') {
            const guild = await this.c.configManager.get('guildConfig', this.i.guildId);
            if (guild) languageCode = guild.language_code;
        };

        const _ = createTranslator(this.c, languageCode);

        const command = this._getCommand(_, i);
        if (!(command instanceof Command)) {
            return command;
        };

        const cooldownCheck = this._isCooldown(_, i);
        if (cooldownCheck) {
            return cooldownCheck;
        };

        return [
            command,
            {
                client: this.c,
                interaction: this.i,
                languageCode,
                _
            }
        ];
    };

    private _isCooldown(_: BoundTranslatorObject, i: ChatInputCommandInteraction): InteractionReplyOptions | void {
        let payload: InteractionReplyOptions = {};

        const command = this.c.commands.get(i.commandName);

        if (typeof command === 'undefined') {
            const e = new Error();
            Logger.error(`.get(i.commandName) failed in isCooldown.`, e);
            return;
        };

        const commandCooldown = command.cooldown;
        const commandName = command.name;

        if (commandCooldown <= 0) {
            return;
        };

        const now = Date.now();

        let userCooldown = this.c.cooldowns.get(this.i.user.id);
        if (!userCooldown) {
            userCooldown = new Collection();
            this.c.cooldowns.set(this.i.user.id, userCooldown);
        };

        const expirationTime = userCooldown.get(commandName);

        if (expirationTime) {
            if (now < expirationTime) {
                const remaining = (expirationTime - now) / 1000;
                return payload = {
                    content: _.COOLDOWN({
                        seconds: remaining.toString(),
                        commandName: i.commandName
                    }),
                    ephemeral: true
                };
            };
        };

        const newExpirationTime = now + commandCooldown * 1000;
        userCooldown.set(commandName, newExpirationTime);
    };

    private _getCommand(_: BoundTranslatorObject, i: ChatInputCommandInteraction): InteractionReplyOptions | Command {
        const command = this.c.commands.get(i.commandName);
        if (typeof command === 'undefined') {
            Logger.error(`Command not found: /${i.commandName}`, new Error());
            return {
                content: _.BASE_ERROR_COMMAND_NOT_FOUND(),
                ephemeral: true
            };
        };

        return command;
    };

    public dispose(): void {
        (this.c as any) = null;
        (this.i as any) = null;
    };
};