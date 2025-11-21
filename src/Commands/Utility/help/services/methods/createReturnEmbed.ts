// src\Commands\Utility\help\services\methods\createReturnEmbed.ts

import { EmbedBuilder, InteractionReplyOptions, MessageFlags } from 'discord.js';
import { Command, CommandContext } from '@/Commands/BaseCommand';

type LocaleStrings = [
    embedTitle: string,
    embedField1Name: string,
    embedField1Value: string
]

export async function createReturnEmbed(c: CommandContext, command: Command): Promise<InteractionReplyOptions> {
    let payload: EmbedBuilder | InteractionReplyOptions;
    const strings: LocaleStrings | null = getLocaleStrings(c, command);

    if (!strings) {
        payload = {
            content: `ERROR, MISSING LOCALE STRINGS`,
            flags: MessageFlags.Ephemeral
        };

    } else {
        const [embedTitle, embedField1Name, embedField1Value] = strings;
        const returnEmbed = new EmbedBuilder()
            .setTitle(embedTitle)
            .setColor(c.client.embedOrangeColor)
            .addFields(
                {
                    name: embedField1Name,
                    value: embedField1Value
                }
            ) as EmbedBuilder;
        payload = {
            embeds: [returnEmbed],
            flags: MessageFlags.Ephemeral
        };
    };

    return payload;
};

function getLocaleStrings(c: CommandContext, command: Command): LocaleStrings | null {
    const localeKey: string[] = [];
    localeKey.push(`COMMAND_${command.name.toUpperCase()}_HELP_EMBED_TITLE`);
    localeKey.push(`COMMAND_${command.name.toUpperCase()}_HELP_EMBED_FIELD1_NAME`);
    localeKey.push(`COMMAND_${command.name.toUpperCase()}_HELP_EMBED_FIELD1_VALUE`);

    const resultStrings: string[] = [];

    for (const key of localeKey) {
        const translatorFn = c._[key];

        if (typeof translatorFn === 'function') {
            resultStrings.push(translatorFn());
            continue;
        };

        return null;
    };

    if (resultStrings.length === 3) {
        return resultStrings as LocaleStrings;
    };

    return null;
};