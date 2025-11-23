//src/Commands/Owner/reload/subCommands/command/methods.ts

import { CommandContext } from '@/commands/baseCommand';
import { getCommandFilePath, reloadModule } from './services/reloadModule';
import { Logger } from '@/utils/logger';

export function reloadCommandMainEntry(c: CommandContext, commandName: string, commandCategory: string | null): Promise<boolean> {
    try {
        const filePath = getCommandFilePath(commandName as string, commandCategory as string | null);

        const reloadedModule = reloadModule(filePath);

        const NewCommandClass = reloadedModule.default || reloadedModule[commandName as string];
        const newCommandInstance = new NewCommandClass(c.client);

        c.client.commands.set(commandName as string, newCommandInstance);

        return Promise.resolve(true);
    } catch (error) {
        Logger.error(`Failed to reload command /${commandName}.\n`, error);
        return Promise.resolve(false);
    };
};