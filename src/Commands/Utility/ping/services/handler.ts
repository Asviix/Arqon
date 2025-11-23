// src\commands\utility\ping\services\handler.ts

import { EmbedBuilder, InteractionResponse, MessageEditOptions } from "discord.js";
import { CommandContext } from "@/commands/baseCommand";

interface PingData {
    ws: string,
    api: string,
    uptime: string,
    memory: string,
    users: string
};

export class PingHandler {
    private c: CommandContext;
    private p: InteractionResponse

    constructor(c: CommandContext, p: InteractionResponse) {
        this.c = c;
        this.p = p;
    };

    public main(): MessageEditOptions {
        const data = this.getStats();
        const payload: MessageEditOptions = {
            embeds: [this.createPingEmbed(data)]
        };

        return payload;
    };

    private getStats(): PingData {
        const ws = this.c.interaction.client.ws.ping.toString();
        const api = (this.p.createdTimestamp - Date.now()).toString();

        // Uptime
        let daysTemp = Math.floor(this.c.interaction.client.uptime / 86400000);
        let hoursTemp = Math.floor(this.c.interaction.client.uptime / 3600000) % 24;
        let minutesTemp = Math.floor(this.c.interaction.client.uptime / 60000) % 60;
        let secondsTemp = Math.floor(this.c.interaction.client.uptime / 1000) % 60;

        let days = daysTemp === 0 ? '' : daysTemp + 'd, ';
        let hours = hoursTemp === 0 ? '': hoursTemp + 'h, ';
        let minutes = minutesTemp === 0 ? '': minutesTemp + 'm, ';
        let seconds = secondsTemp === 0 ? '': secondsTemp + 's';

        let uptime = days + hours + minutes + seconds;

        if (uptime.endsWith(', ')) {
            uptime = uptime.slice(0, -2);
        };

        if (uptime === '') {
            uptime = 'Less than 1 second.'
        };

        const memory: string = (process.memoryUsage().rss / 1000000).toString();
        const users: string = this.c.client.users.cache.size.toString();

        return {ws, api, uptime, memory, users}
    };

    private createPingEmbed(data: PingData): EmbedBuilder {
        const title: string = this.c._.COMMAND_PING_EMBED_TITLE();
        const field_name: string = this.c._.COMMAND_PING_EMBED_FIELD_NAME();
        const field_value: string = this.c._.COMMAND_PING_EMBED_FIELD_VALUE({
            wsping: data.ws,
            apiLatency: data.api,
            uptime: data.uptime,
            memoryUsage: data.memory,
            users: data.users
        });

        return new EmbedBuilder()
            .setTitle(title)
            .setColor(this.c.client.embedOrangeColor)
            .addFields(
                {
                    name: field_name,
                    value: field_value
                }
            )
            .setTimestamp()
    };

    public dispose(): void {
        (this.c as any) = null;
        (this.p as any) = null;
    };
};