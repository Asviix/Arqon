// src\Commands\Utility\help\services\methods\getLocaleStrings\getLocaleStrings.ts

import { CommandContext, Command } from "@/Commands/BaseCommand";
import { LocaleStrings } from "@help/types/types";

export async function getLocaleStrings(c: CommandContext, command: Command): Promise<LocaleStrings | undefined> {
    let payload: LocaleStrings | undefined = undefined;

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
    };

    if (resultStrings.length === 3) {
        payload = resultStrings as LocaleStrings;
    };

    return payload;
};