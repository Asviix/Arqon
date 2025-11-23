// src\Commands\Owner\reload\subCommands\command\services\reloadModule.ts

import * as path from 'path';
import { COMMANDS_BASE_DIR as commandsDir } from '@/index';
import { Logger } from '@/utils/logger';

export function getCommandFilePath(inputName: string, category: string | null): string {

    let filePath: string;

    if (typeof category === 'string') {
        filePath = path.join(commandsDir, category, inputName, `command.ts`);
    } else {
        filePath = path.join(commandsDir, inputName, `command.ts`);
    };

    return filePath;
};

function clearCacheRecursively(absolutePath: string, visited: Set<string>): void {
    const module = require.cache[absolutePath];

    if (module) {
        visited.add(absolutePath);

        for (const child of module.children) {
            if (require.cache[child.id] && !visited.has(child.id)) {
                clearCacheRecursively(child.id, visited);
            };
        };
        
        delete require.cache[absolutePath];
    };
};

export function reloadModule(modulePath: string): any {
    const absolutePath = path.resolve(modulePath);

    const visitedModules = new Set<string>();

    clearCacheRecursively(absolutePath, visitedModules);
    
    try {
        const fileToRequire = absolutePath.endsWith('.ts') 
            ? absolutePath.slice(0, -3)
            : absolutePath;

        return require(fileToRequire);
    } catch (error) {
        Logger.error(`Error reloading module at ${absolutePath}:`, error);
        throw new Error(`Failed to reload module: ${absolutePath}`);
    };
};