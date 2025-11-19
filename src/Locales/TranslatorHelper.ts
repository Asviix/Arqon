// src\Locales\TranslatorHelper.ts

import { BotClient } from '@/Client/BotClient';
import { LocalizationKeys } from './keys';

/**
 * Creates a locally bound 't' (translate) function for use in a command file.
 * This simplifies the call from client.localizationManager.translate(locale, key, args...)
 * to just t(key, args...).
 * @param client The BotClient instance.
 * @param languageCode The locale to bind (usually interaction.locale).
 * @returns A bound function 't' for easy translation.
 */
export function createTranslator(client: BotClient, languageCode: string): (key: LocalizationKeys, ...args: any[]) => string {
    
    // Return a function that is bound to the client and languageCode arguments.
    return (key: LocalizationKeys, ...args: any[]) => {
        return client.localizationManager.translate(languageCode, key, ...args);
    };
}