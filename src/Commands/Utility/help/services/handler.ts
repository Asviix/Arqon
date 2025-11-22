// src\Commands\Utility\help\services\helpHandler.ts

import { Command, CommandContext } from "@/Commands/BaseCommand";
import { EmbedBuilder, InteractionReplyOptions, MessageFlags } from "discord.js";
import { LocaleStrings } from "@help/types/types";

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
                content: `This command does not exist!`,
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
        const [embedTitle, embedField1Name, embedField1Value] = strings;
        const returnEmbed: EmbedBuilder = new EmbedBuilder()
            .setTitle(embedTitle)
            .setColor(this.c.client.embedOrangeColor)
            .addFields(
                {
                    name: embedField1Name,
                    value: embedField1Value
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
        localeKey.push(`COMMAND_${command.name.toUpperCase()}_HELP_EMBED_TITLE`);
        localeKey.push(`COMMAND_${command.name.toUpperCase()}_HELP_EMBED_FIELD1_NAME`);
        localeKey.push(`COMMAND_${command.name.toUpperCase()}_HELP_EMBED_FIELD1_VALUE`);

        const resultStrings: string[] = [];

        for (const key of localeKey) {
            const translatorFn = this.c._[key];

            if (typeof translatorFn === 'function') {
                resultStrings.push(translatorFn());
                continue;
            };
        };

        if (resultStrings.length === 3) {
            return resultStrings as LocaleStrings;
        };
    };

    public dispose(): void {
        (this.c as any) = null;
    };
};