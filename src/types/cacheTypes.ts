// src\types\cacheTypes.ts

import { ConfigManager } from "@/managers/configManager";
import { Collection } from "discord.js";

export type Caches = ConfigManager['caches'];
export type CacheName = keyof Caches;
export type CacheKey<K extends CacheName> = Caches[K] extends Collection<infer Key, any> ? Key : never;;
export type CacheValue<K extends CacheName> = Caches[K] extends Collection<any, infer Val> ? Val : never;
export type CacheReturn<K extends CacheName> = ReturnType<Caches[K]['get']>;