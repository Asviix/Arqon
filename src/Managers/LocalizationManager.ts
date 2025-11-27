// src\Locales\LocalizationManager.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { BotClient } from '@/client/botClient';
import { LocalizationKeys } from '@/locales/data/keys';
import { Logger } from '@/utils/Logger';

// 1. Updated Interface: Keys can be a simple string OR a function (for parameterized messages)
export type LocalizationValue = string | ((...args: any[]) => string);

export const DEFAULT_LOCALE = 'en-US';

export interface LocaleStrings {
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
        
        const localesPath = path.resolve(__dirname, '..', 'Locales', 'locales');
        const locales: LocaleStrings = {};

        try {
            const files = await fs.readdir(localesPath);
            let targetExtension = '';

            if (files.some(f => f.endsWith('js'))) {
                targetExtension = '.js';
            } else {
                targetExtension = '.ts';
            };

            Logger.debug(`Detected runtime environment: Search for ${targetExtension} files.`);

            for (const file of files) {
                if (file.endsWith(targetExtension)) {
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