// src\types\dbTypes.ts

export type queryResult<T> = { ok: boolean , value : T | null , error?: Error};