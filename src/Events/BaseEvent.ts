// src\Events\BaseEvent.ts

import { BotClient } from "@/Client/BotClient";

export abstract class EventHandler {
    public abstract name: string;
    public once: boolean = false;

    /**
     * The main execution method for the event.
     * @param client The custom BotClient instance.
     * @param args The arguments passed by the discord.js event emitter.
     */
    public abstract execute(client: BotClient, ...args: any[]): Promise<void>;
};