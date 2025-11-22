// src\Commands\Utility\help\services\helpHandler.ts

import { CommandContext } from "@/Commands/BaseCommand";
import { InteractionReplyOptions } from "discord.js";
import { createReturnEmbed } from "@help/services/methods/createReturnEmbed/main";

export class HelpHandler {
    private c: CommandContext;

    constructor(c: CommandContext) {
        this.c = c;
    };

    public async main(): Promise<InteractionReplyOptions> {       
        return await createReturnEmbed(this.c);
    };

    public dispose(): void {
        (this.c as any) = null;
    };
};