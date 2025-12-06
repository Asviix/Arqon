// src\commands\player\play\player_playHandler.ts

import { CommandContext } from "@/commands/baseCommand";
import { Logger } from "@/utils/logger";
import * as dsp from 'discord-player';
import { YoutubeSabrExtractor } from "discord-player-googlevideo";
import { BaseMessageOptions, GuildMember } from "discord.js";

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

        try {
            const player = dsp.useMainPlayer();

            const { track } = await player.play(voiceChannel, this.song, {
                nodeOptions: {
                    metadata: this.c.interaction
                },
                requestedBy: this.c.interaction.user
            });

            return payload = {
                content: `Playing:\n${track.title} by ${track.author} on ${track.source}.`
            };
        } catch (e) {
            Logger.error('Failed to play audio:', e);
            return payload = {
                content: `❌ Could not start playback (Check logs for error).`
            };
        };
    };

    public dispose(): void {
        (this.c as any) = null;
    };
};