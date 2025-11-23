// src\Commands\Utility\help\services\helpHandler.ts

import { EmbedBuilder, InteractionReplyOptions, MessageFlags } from "discord.js";
import { Command, CommandContext } from "@/commands/baseCommand";
import { LocaleStrings } from "../types";
import { LocaleStringsEnum as lsm , HelpKeysEnum as hku} from "../enums";

export class HelpHandler {
    private c: CommandContext;

    constructor(c: CommandContext) {
        this.c = c;
    };

    public async main(): Promise<InteractionReplyOptions> {
        const command: Command | undefined = await this.checkCommand();
        let strings: LocaleStrings | undefined = undefined;

        if (command instanceof Command) {
            strings = await this.getLocaleStrings(command);
        } else if (typeof command === 'undefined') {
            return {
                content: this.c._.COMMAND_PING_ERROR_COMMAND_NO_EXIST(),
                flags: MessageFlags.Ephemeral
            };
        };

        if (typeof strings === 'undefined') {
            return {
                content: `ERROR, MISSING LOCALE STRINGS`,
                flags: MessageFlags.Ephemeral
            };
        };

        return await this.createReturnEmbed(strings);
    };

    private async createReturnEmbed(strings: LocaleStrings): Promise<InteractionReplyOptions> {
        const returnEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle(strings[lsm.embedTitle])
            .setColor(this.c.client.embedOrangeColor)
            .addFields(
                {
                    name: strings[lsm.embedField1Name],
                    value: strings[lsm.embedField1Value]
                },
                {
                    name: strings[lsm.embedField2Name],
                    value: strings[lsm.embedField2Value]
                }
            ) as EmbedBuilder;
        return {
            embeds: [returnEmbed],
            flags: MessageFlags.Ephemeral
        };
    };

    private async checkCommand(): Promise<Command | undefined> {
        const commandArg: string | null = this.c.interaction.options.getString('command');
        return this.c.client.commands.find(command => command.name === commandArg);
    };

    private async getLocaleStrings(command: Command): Promise<LocaleStrings | undefined> {
        const localeKey: string[] = [];

        for (const key of Object.keys(hku)) {
            if (isNaN(Number(key))) {
                localeKey.push(`COMMAND_${command.name.toUpperCase()}_HELP_EMBED_${key}`);
            };
        };

        const resultStrings: string[] = [];

        for (const key of localeKey) {
            const translatorFn = this.c._[key];

            if (typeof translatorFn === 'function') {
                resultStrings.push(translatorFn());
                continue;
            };
        };

        if (resultStrings.length === Object.keys(hku).length / 2) {
            return resultStrings as LocaleStrings;
        };
    };

    public dispose(): void {
        (this.c as any) = null;
    };
};