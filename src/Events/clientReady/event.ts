// src\Events\clientReady\event.ts

import { BotClient } from '@/Client/BotClient';
import { EventHandler } from '@/Events/BaseEvent';
import { ReadyHandler } from './services/handler';

export default class ReadyEvent extends EventHandler {
    public name = 'clientReady';
    public once = true;

    public async execute(client: BotClient): Promise<void> {
        const SYNC_INTERVAL_MS = 5 * 60 * 1000;

        const h = new ReadyHandler(client);
        await h.main();

        setInterval(() => {
            client.db.syncSessionCounters();
        }, SYNC_INTERVAL_MS);
    };
};