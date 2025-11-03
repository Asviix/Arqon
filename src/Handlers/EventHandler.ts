// src\Handlers\EventHandler.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from '../Utils/Logger';
import { BotClient } from '../Client/BotClient';
import { EventHandler } from '../Events/BaseEvent';

const isTypeScriptEnv = process.execArgv.join('').includes('ts-node');
const expectedExtension = isTypeScriptEnv ? '.ts' : '.js';

export class EventLoadHandler {
    private client: BotClient;
    private eventPath: string = path.join(__dirname, '..', 'Events');

    constructor(client: BotClient) {
        this.client = client;
    };

    public async load(): Promise<void> {
        Logger.debug('Starting the eventHandler...');
        await this.loadDirectory(this.eventPath);
    };

    private async loadDirectory(dirPath: string): Promise<void> {
        try {
            const items = await fs.readdir(dirPath, {withFileTypes: true});

            for (const item of items) {
                const fullPath = path.join(dirPath, item.name);

                if (item.isDirectory()) {
                    await this.loadDirectory(fullPath);
                } else if (item.isFile() && item.name === 'event' + expectedExtension) {
                    const runtimePath = fullPath;

                    const { default: EventClass } = await import (runtimePath);

                    if (EventClass && typeof EventClass === 'function') {
                        const event: EventHandler = new EventClass();
                        const boundExecute = event.execute.bind(event, this.client);
                        if (event.once) {
                            this.client.once(event.name, boundExecute);
                        } else {
                            this.client.on(event.name, boundExecute);
                        };

                        this.client.eventFiles.set(event.name, event);
                        Logger.event(`Event Loaded: ${event.name} (Once: ${event.once})`);
                    };
                };
            };
        } catch (error) {
            Logger.error(`Error loading events from ${dirPath}:\n`, error);
        };
    };
};