// src\Locales\LocalizationManager.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '@/Utils/Logger';
import { BotClient } from '@/Client/BotClient';
import { LocalizationKeys } from './keys'; // Import the type for better internal clarity

// 1. Updated Interface: Keys can be a simple string OR a function (for parameterized messages)
export type LocalizationValue = string | ((...args: any[]) => string);

export interface LocaleStrings {
    // Maps locale code (e.g., 'en-US') to a key-value object
    [localeCode: string]: Record<LocalizationKeys, LocalizationValue>;
};

export class LocalizationManager {
    private client: BotClient

    constructor(client: BotClient) {
        this.client = client;
    };

    public DEFAULT_LOCALE = 'en-US';

    // REMOVED: The public getString method is no longer needed. 
    // The t alias handles accessing the function and passing arguments.

    /**
     * Loads all localization files from the locales directory using dynamic import().
     * This loads the compiled JavaScript files that export the localization objects.
     * @returns A promise resolving to the object mapping locale codes to their strings/functions.
     */
    public async loadLocales(): Promise<LocaleStrings> {
        Logger.debug('Loading locales...');
        
        const localesPath = path.join(__dirname);
        const locales: LocaleStrings = {};

        const IGNORED_FILES = ['LocalizationManager', 'keys', 'TranslatorHelper'];

        try {
            const files = await fs.readdir(localesPath);
            let targetExtension = '';

            if (files.some(f => f.endsWith('js') && !IGNORED_FILES.some(ignore => f.includes(ignore)))) {
                targetExtension = '.js';
            } else {
                targetExtension = '.ts';
            };

            Logger.debug(`Detected runtime environment: Search for ${targetExtension} files.`);

            for (const file of files) {
                if (file.endsWith(targetExtension) && !IGNORED_FILES.some(ignore => file.includes(ignore))) {
                    const localeCode = file.replace(targetExtension, '');
                    const filePath = path.join(localesPath, file);
                    
                    const module = await import(filePath); 
                    locales[localeCode] = module.en; 
                    
                    Logger.info(`Locale Loaded: ${localeCode}`);
                };
            };
        } catch (error) {
            Logger.error('Error loading localization files:\n', error);
        };

        return locales;
    };

    public translate(languageCode: string, key: LocalizationKeys, ...args: any[]): string {
        const translator =
            this.client.locales[languageCode]?.[key]
            || this.client.locales[this.DEFAULT_LOCALE]?.[key];

        if (!translator) {
            return `[MISSING STRING: ${languageCode}.${key}]`;
        };

        if (typeof translator === 'function') {
                const parameterizedFn = translator as (...a: any[]) => string;

                try {
                    return parameterizedFn(...args);
                } catch (error) {
                    Logger.error(`Error calling translator for key '${key}'\n`, error);
                    return `[TRANSLATION ERROR: ${key}]`;
                };
            };

            return String(translator);
    }
};