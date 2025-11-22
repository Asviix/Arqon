// src\Commands\Utility\help\services\methods\createReturnEmbed.ts

import { EmbedBuilder, InteractionReplyOptions, MessageFlags } from 'discord.js';
import { Command, CommandContext } from '@/Commands/BaseCommand';
import { getLocaleStrings } from '@help/services/methods/getLocaleStrings/main';
import { LocaleStrings } from '@help/types/types';
import { checkCommand } from '../checkCommand/main';

export async function createReturnEmbed(c: CommandContext): Promise<InteractionReplyOptions> {
    let payload: InteractionReplyOptions;

    const command = await checkCommand(c);

    if (command === null) {
        payload = {
            content: `This command does not exist!`,
            flags: MessageFlags.Ephemeral
        };
    };

    let strings: LocaleStrings | undefined = undefined;
    if (command instanceof Command) {
        strings = await getLocaleStrings(c, command);
    };

    if (typeof strings === 'undefined') {
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