// src\Locales\LocalizationManager.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { BotClient } from '@/Client/BotClient';
import { LocalizationKeys } from './keys';
import { Logger } from '@/Utils/Logger';

// 1. Updated Interface: Keys can be a simple string OR a function (for parameterized messages)
export type LocalizationValue = string | ((...args: any[]) => string);

export const DEFAULT_LOCALE = 'en-US';

export interface LocaleStrings {
    // Maps locale code (e.g., 'en-US') to a key-value object
    [localeCode: string]: Record<LocalizationKeys, LocalizationValue>;
};

export class LocalizationManager {
    private static instance: LocalizationManager;
    private client: BotClient

    private constructor(client: BotClient) {
        this.client = client;
    };

    public static getInstance(client: BotClient): LocalizationManager {
        if (!LocalizationManager.instance) {
            Logger.debug('Creating LocalizationManager instance...');
            LocalizationManager.instance = new LocalizationManager(client);
        };
        return LocalizationManager.instance;
    };

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
            || this.client.locales[DEFAULT_LOCALE]?.[key];

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
    };
};