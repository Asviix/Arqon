// src\commands\player\play\player_playHandler.ts

import { CommandContext } from "@/commands/baseCommand";
import { joinVoiceChannel } from "@discordjs/voice";
import { BaseMessageOptions, GuildMember, VoiceBasedChannel } from "discord.js";

export class player_playHandler {
    private c: CommandContext
    private song: string

    constructor(c: CommandContext) {
        this.c = c;
        this.song = this.c.interaction.options.getString('song', true);
    };

    public async main(): Promise<BaseMessageOptions> {
        let payload: BaseMessageOptions;

        const voiceChannel = (this.c.interaction.member as GuildMember).voice.channel;

        if (!voiceChannel) {
            return { content: `You are not in a voice channel!` }
        };

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });

        return payload = {
            content: `Joined voice channel!`
        };
    };

    public dispose(): void {
        (this.c as any) = null;
    };
};