// src\Utils\Permissions.ts

import { OWNER_IDS } from "../Config/Owners";

/**
 * Checks if the given user ID is part of the owning team.
 * @param userId The ID of the user to compare against.
 * @returns A Boolean (true if the user is an owner.)
 */
export function isOwner(userId: string): boolean {
    return OWNER_IDS.includes(userId);
};