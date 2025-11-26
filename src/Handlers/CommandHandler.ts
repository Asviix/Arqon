// src\Handlers\CommandHandler.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { BotClient } from '@/client/botClient';
import { Command } from '@/commands/baseCommand';
import { Logger } from '@/utils/logger';

const isTypeScriptEnv = process.execArgv.join('').includes('ts-node');
const expectedExtension = isTypeScriptEnv ? '.ts' : '.js';

export class CommandHandler {
    private client: BotClient;
    private commandsPath: string = path.join(__dirname, '..', 'Commands');

    constructor(client: BotClient) {
        this.client = client;
    };

    public async load(): Promise<void> {
        Logger.debug('Starting the commandHandler...');
        await this.loadDirectory(this.commandsPath);
    };

    private async loadDirectory(dirPath: string): Promise<void> {
        try {
            const items = await fs.readdir(dirPath, {withFileTypes: true});

            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);

                if (item.isDirectory()) {
                    await this.loadDirectory(fullPath);
                } else if (item.isFile() && item.name === 'command' + expectedExtension) {
                    const runtimePath = fullPath;
                    
                    const { default: CommandClass } = await import(runtimePath);

                    if (CommandClass && typeof CommandClass === 'function') {
                        const command: Command = new CommandClass();
                        this.client.commands.set(command.name, command);
                        Logger.command(`Command loaded: ${command.name}`);
                    };
                };
            };
        } catch (error) {
            Logger.error(`Error loading commands from ${dirPath}:\n`, error);
        };
    };
};