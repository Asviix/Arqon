// src/Locales/TranslatorHelper.ts

import { BotClient } from '@/Client/BotClient';
import { LocalizationKeys } from './keys';
import { LocaleArgsMap } from './interfaces';
import { DEFAULT_LOCALE } from './LocalizationManager';

type ArgRequiredKeys = { 
    [K in LocalizationKeys]: LocaleArgsMap[K] extends void ? never : K 
}[LocalizationKeys];

type NoArgKeys = Exclude<LocalizationKeys, ArgRequiredKeys>;

export type BoundTranslatorObject = {
    [K in NoArgKeys]: (args?: void) => string;
} & {
    [K in ArgRequiredKeys]: (args: LocaleArgsMap[K]) => string;
};

export function createTranslator(client: BotClient, languageCode: string): BoundTranslatorObject {
    
    const boundObject: Partial<BoundTranslatorObject> = {};

    for (const key of Object.keys(client.locales[languageCode] || client.locales[DEFAULT_LOCALE])) {
        boundObject[key as LocalizationKeys] = (args: any) => {
             return client.localizationManager.translate(languageCode, key as LocalizationKeys, args);
        };
    }

    return boundObject as BoundTranslatorObject;
}