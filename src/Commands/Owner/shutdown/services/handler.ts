// src\commands\owner\shutdown\services\handler.ts

import { InteractionReplyOptions, InteractionResponse, MessageFlags } from "discord.js";
import { spawn } from "child_process";
import { CommandContext } from "@/commands/baseCommand";
import { isOwner } from "@/utils/permissions";
import { Logger } from "@/utils/logger";

export class ShutdownHandler {
    private c: CommandContext;

    constructor(c: CommandContext) {
        this.c = c;

        this.main();
    };
    
    private async main(): Promise<void> {
        let payload: InteractionReplyOptions;

        if (!isOwner(this.c.interaction.user.id)) {
            payload = {
                content: `What are you even trying to do ?`,
                flags: MessageFlags.Ephemeral
            };
            await this.c.interaction.reply(payload);
            return;
        };

        const bool = this.c.interaction.options.getBoolean('auto_restart');

        payload = {
            content: bool ?  'Restarting...': 'Shutting down...',
            flags: MessageFlags.Ephemeral
        };

        await this.c.interaction.reply(payload);

        if (bool) {
            await this.restartApp();
        } else {
            await this.shutdownApp();
        };
    };

    private async restartApp(): Promise<void> {
        Logger.info(`Restarting application with PM2... Ordered by ${this.c.interaction.user.displayName} (${this.c.interaction.user.id}) in ${this.c.interaction.guild!.name} (${this.c.interaction.guildId}) on ${new Date().toLocaleString('en-GB')}`);

        await this.c.client.db.syncSessionCounters();
        this.c.client.destroy();

        process.exit(105);
    };

    private async shutdownApp(): Promise<void> {
        Logger.info(`Shutting down gracefully... Ordered by ${this.c.interaction.user.displayName} (${this.c.interaction.user.id}) in ${this.c.interaction.guild!.name} (${this.c.interaction.guildId}) on ${new Date().toLocaleString('en-GB')}`);

        await this.c.client.db.syncSessionCounters();
        
        this.c.client.destroy();
        process.exit(0);
    };
};