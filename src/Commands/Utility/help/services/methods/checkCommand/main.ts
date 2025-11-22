// src\Commands\Utility\help\services\methods\checkCommand\main.ts

import { Command, CommandContext } from "@/Commands/BaseCommand";

export async function checkCommand(c: CommandContext): Promise<Command | undefined> {
    let payload: Command | undefined = undefined;
    const commandArg = c.interaction.options.getString('command');
    const command = c.client.commands.find(command => command.name === commandArg);

    if (typeof command !== undefined) {
        payload = command;
    };

    return payload;
}