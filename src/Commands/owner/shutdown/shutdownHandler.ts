// src\commands\owner\shutdown\services\handler.ts

import { CommandContext } from "@/commands/baseCommand";
import { Logger } from "@/utils/logger";
import { isOwner } from "@/utils/permissions";
import { InteractionReplyOptions, MessageFlags } from "discord.js";

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
            content: bool ?  'Shutting down... (sent restart code to PM2)' : 'Shutting down...',
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
        Logger.info(`Shutting Down... (sent restart code to PM2) Ordered by ${this.c.interaction.user.displayName} (${this.c.interaction.user.id}) in ${this.c.interaction.guild!.name} (${this.c.interaction.guildId}) on ${new Date().toLocaleString('en-GB')}`);
        this.c.client.destroy();

        process.exit(105);
    };

    private async shutdownApp(): Promise<void> {
        Logger.info(`Shutting down gracefully... Ordered by ${this.c.interaction.user.displayName} (${this.c.interaction.user.id}) in ${this.c.interaction.guild!.name} (${this.c.interaction.guildId}) on ${new Date().toLocaleString('en-GB')}`);
        
        this.c.client.destroy();
        process.exit(0);
    };
};