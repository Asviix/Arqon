// src\Events\clientReady\services\handler.ts

import { 
    ActivityType,
    ApplicationCommandDataResolvable,
    ClientApplication,
    ClientUser,
    EmbedBuilder,
    FetchPinnedMessagesResponse,
    Guild,
    GuildBasedChannel,
    Message,
    MessagePin,
    TextChannel 
} from "discord.js";

import { BotClient } from "@/Client/BotClient";
import { Logger } from "@/Utils/Logger";

export class ReadyHandler {
    private c: BotClient;

    constructor(c: BotClient) {
        this.c = c;
    };

    public async main(): Promise<void> {

        const promises = [
            this._registerCommands(),
            this._editPinnedMessage()
        ];

        this._setActivity();

        await Promise.all(promises);

        if (this.c.user instanceof ClientUser && this.c.application instanceof ClientApplication) {
            Logger.success(`Bot is online! Logged in as ${this.c.user.tag}`);
            Logger.info(`Bot Client ID: ${this.c.application.id}`);
        } else {
            Logger.warn(`Completed ready services, but client user or application object is missing.`)
        }
    };

    private async _registerCommands(): Promise<void> {
        const commandData: ApplicationCommandDataResolvable[] = Array.from(this.c.commands.values()).map(c => c.commandData);
        Logger.command(`Registering ${commandData.length} guild commands...`)

        let ca: ClientApplication | null = this.c.application;
        if (!ca) {
            return Logger.warn(`ClientUser object is not available.`);
        };

        try {
            const DEV_DISCORD_ID: string | undefined = process.env.DEV_DISCORD_ID;
            if (typeof DEV_DISCORD_ID === 'undefined') {
                return Logger.error(`DEV_DISCORD_GUILD_ID environment variable is missing or not a string.`, typeof DEV_DISCORD_ID)
            }
            await ca.commands.set(commandData, DEV_DISCORD_ID);
            Logger.success(`Registered ${commandData.length} commands.`)
        } catch (error) {
            Logger.error(`Error during command registration:`, error);
        };
    };

    private _setActivity(): void {
        Logger.info(`Settings activity...`);

        if (this.c.user instanceof ClientUser) {
            const ACTIVITY_NAME: string = `your advanced features!`;
            const ACTIVITY_TYPE: ActivityType = ActivityType.Watching;

            try {
                this.c.user.setActivity({
                    name: ACTIVITY_NAME,
                    type: ACTIVITY_TYPE
                });
                Logger.success(`Set activity to "${ActivityType[ActivityType.Watching]} ${ACTIVITY_NAME}"`);
            } catch (e) {
                Logger.error(`An unexpected error occured while trying to set the activity.`, e);
            };
        } else {
            Logger.warn('Cannot set activity: Client user object is not available.');
        };
    };

    private async _editPinnedMessage(): Promise<void> {
        Logger.info(`Editing pinned message...`);

        // Validate DEV_DISCORD_GUILD_ID type.
        const DEV_DISCORD_ID = process.env.DEV_DISCORD_ID;
        if (typeof DEV_DISCORD_ID !== 'string') {
            return Logger.warn(`DEV_DISCORD_GUILD_ID environment variable is missing or not a string.`, typeof DEV_DISCORD_ID);
        };

        // Try fetching Guild object.
        let DEV_DISCORD_GUILD: Guild;
        try {
            DEV_DISCORD_GUILD = await this.c.guilds.fetch(DEV_DISCORD_ID);
        } catch (e) {
            return Logger.warn(`Failed to fetch Guild with ID ${DEV_DISCORD_ID}`);
        };

        // Validate DEV_DISCORD_LOGS_CHANNEl_ID type.
        const DEV_DISCORD_LOGS_CHANNEl_ID = process.env.DEV_LOGS_CHANNEL;
        if (typeof DEV_DISCORD_LOGS_CHANNEl_ID !== 'string') {
            return Logger.warn(`DEV_DISCORD_LOGS_CHANNEl_ID environment variable is missing or not a string.`, typeof DEV_DISCORD_LOGS_CHANNEl_ID);
        };
        
        // Try fetching GuildBasedChannel object.
        let DEV_DISCORD_LOGS_CHANNEL: GuildBasedChannel | undefined;
        DEV_DISCORD_LOGS_CHANNEL = DEV_DISCORD_GUILD.channels.cache.get(DEV_DISCORD_LOGS_CHANNEl_ID);

        // Validate DEV_DISCORD_LOGS_CHANNEL existence.
        if (!DEV_DISCORD_LOGS_CHANNEL) {
            return Logger.warn(`Channel with ID ${DEV_DISCORD_LOGS_CHANNEl_ID} not found/cached.`);
        };

        // Validate DEV_DISCORD_LOGS_CHANNEL type.
        if (!(DEV_DISCORD_LOGS_CHANNEL instanceof TextChannel)) {
            return Logger.warn(`Channel ${DEV_DISCORD_LOGS_CHANNEL.name} is not a TextChannel and cannot have messages edited.`);
        };

        // Try fetching pinned messages.
        let pins: FetchPinnedMessagesResponse<true>;
        try {
            pins = await DEV_DISCORD_LOGS_CHANNEL.messages.fetchPins();
        } catch (e) {
            return Logger.warn(`Cannot fetched pinned messsages of channel ${DEV_DISCORD_LOGS_CHANNEL.name}.`);
        };

        // Type Guard the client user.
        let cu: ClientUser | null = this.c.user;
        if (!cu) {
            return Logger.warn(`ClientUser object is not available.`);
        };

        // Fetch the pinned message.
        let pinnedMessage: MessagePin<true> | undefined;
        pinnedMessage = pins.items.find(msg => msg.message.author.id === cu.id);

        // Create the embed
        const readyEmbed = this._createReadyEmbed();

        // Check for message's existence, and send it otherwise.
        await this._handleLogMessage(pinnedMessage, DEV_DISCORD_LOGS_CHANNEL, readyEmbed);
    };

    private _createReadyEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(`✅ Bot is online!`)
            .setColor(0x00FF00)
            .setDescription(`Service successfully initialized and connected to Discord.`)
            .setAuthor({
                name: 'Arqon'
            })
            .addFields(
                { name: `**Environment:**`, value: this.c.isProd ? 'Production' : 'Development' },
                { name: `**Total Guilds:**`, value: `${this.c.guilds.cache.size}` }
            )
            .setTimestamp(new Date());
    };

    private async _handleLogMessage(pinnedMessage: MessagePin<true> | undefined, DEV_DISCORD_LOGS_CHANNEL: TextChannel, readyEmbed: EmbedBuilder): Promise<void> {
        if (typeof pinnedMessage === 'undefined') {
            try {
                Logger.info(`Pinned message missing, creating new...`);
                const newMsg = await DEV_DISCORD_LOGS_CHANNEL.send({
                    embeds: [readyEmbed]
                });
                await newMsg.pin(`Missing log message, pinned a new one.`);
                Logger.success(`Created and pinned new log message.`)
            } catch (e) {
                Logger.error(`Unable to send/pin the log message.`, e);
            };
        } else if (pinnedMessage.message instanceof Message) {
            try {
                await pinnedMessage.message.edit({
                    embeds: [readyEmbed]
                });
                Logger.success(`Edited the log message.`)
            } catch (e) {
                Logger.error(`Unable to edit the pinned message.`, e);
            };
        } else {
            Logger.warn(`Pinned item was found but not resolvable as a Message.`)
        };
    };
};