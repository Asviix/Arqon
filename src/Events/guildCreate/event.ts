// src\Events\guildCreate\event.ts

import { Guild } from "discord.js";
import { BotClient } from "@/client/botClient";
import { EventHandler } from "@/events/baseEvent";

export default class GuildCreateEvent extends EventHandler {
    public name = 'guildCreate';
    public once = false;

    public async execute(client: BotClient, guild: Guild): Promise<void> {
        const NEW_GUILD_ID = guild.id;

        await client.configManager.set('guildConfig', NEW_GUILD_ID);

        return;
    };
};