// src\Commands\Utility\help\services\helpHandler.ts

import { Command, CommandContext } from "@/Commands/BaseCommand";
import { EmbedBuilder, InteractionReplyOptions, MessageFlags } from "discord.js";
import { createReturnEmbed } from "./methods/createReturnEmbed";

export class HelpHandler {
    private c: CommandContext

    constructor(c: CommandContext) {
        this.c = c;
    };

    public async main(): Promise<InteractionReplyOptions> {
        const commandArg: string = this.c.interaction.options.getString('command') as string;
        const command: Command = this.c.client.commands.find(command => command.name === commandArg) as Command;        
        return await createReturnEmbed(this.c, command);;
    };
};