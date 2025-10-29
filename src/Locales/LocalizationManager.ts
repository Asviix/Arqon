// src\Locales\LocalizationManager.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../Utils/Logger';
import { BotClient } from '../Client/BotClient';

export interface LocaleStrings {
    [key: string]: { [stringKey: string]: string };
};

export class LocalizationManager {
    private client: BotClient

    constructor(client: BotClient) {
        this.client = client;
    };

    public DEFAULT_LOCALE = 'en-US';

    /**
     * Gets the formatted and replaced locale string using the template.
     * @param languageCode The locale to use.
     * @param key The string choosen.
     * @param replacements Replacements made if necessary.
     * @returns The formatted and replaced string in the correct locale.
     */
    public async getString(languageCode: string, key: string, replacements: Record<string, string> = {}): Promise<string> {
        let stringTemplate = this.client.locales[languageCode]?.[key];

        if (!stringTemplate) {
            stringTemplate = this.client.locales['en-US']?.[key];
        };

        if (!stringTemplate) {
            return `[MISSING STRING: ${languageCode}.${key}]`;
        };

        let finalString = stringTemplate;
        for (const [placeholder, value] of Object.entries(replacements)) {
            finalString = finalString.replace(`{${placeholder}}`, value);
        };

        return finalString;
    };

    /**
     * Loads all localization files from the locales directory.
     * @returns A promise resolving to an object mapping locale codes to their strings.
     */
    public async loadLocales(): Promise<LocaleStrings> {
        const localesPath = path.join(__dirname);
        const locales: LocaleStrings = {};

        try {
            const files = await fs.readdir(localesPath);

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const localeCode = file.replace('.json', '');
                    const filePath = path.join(localesPath, file);
                    const content = await fs.readFile(filePath, 'utf-8');

                    locales[localeCode] = JSON.parse(content);
                    Logger.info(`Locale Loaded: ${localeCode}`);
                };
            };
        } catch (error) {
            Logger.error('Error loading localization files:\n', error);
        };

        return locales;
    };
}
