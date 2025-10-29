// src\Events\guildCreate\event.ts

import { BotClient } from "../../Client/BotClient";
import { EventHandler } from "../BaseEvent";
import { Guild } from "discord.js";

export default class GuildCreateEvent extends EventHandler {
    public name = 'guildCreate';
    public once = false;

    public async execute(client: BotClient, guild: Guild): Promise<void> {
        const NEW_GUILD_ID = guild.id;

        client.db.initializeGuildConfig(NEW_GUILD_ID);

        return;
    };
};