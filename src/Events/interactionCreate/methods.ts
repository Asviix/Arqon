// src\Events\interactionCreate\methods.ts

import { Command } from "@/Commands/BaseCommand";
import { BotClient } from "@/Client/BotClient";
import { ChatInputCommandInteraction, Collection, MessageFlags } from "discord.js";

/**
 * Check if the user initiating the command is in cooldown for that command.
 * @param userId The user ID that initiated the interaction.
 * @param command The command to check the cooldown of.
 * @param client The BotClient instance.
 * @returns [boolean, number] - The Boolean is true if the user is in cooldown, The time is 0 if not, otherwise the time remaining.
 */
export async function isCooldown(client: BotClient, userId: string, command: Command): Promise<[boolean, number]> {
    const commandCooldown = command.cooldown;
    const commandName = command.name;
    
    if (commandCooldown <= 0) {
        return [false, 0];
    };

    const now = Date.now();

    let userCooldown = client.cooldowns.get(userId);
    if (!userCooldown) {
        userCooldown = new Collection();
        client.cooldowns.set(userId, userCooldown);
    };

    const expirationTime = userCooldown.get(commandName);

    if (expirationTime) {
        if (now < expirationTime) {
            const remaining = (expirationTime - now) / 1000;
            return [true, remaining];
        };
    };

    const newExpirationTime = now + commandCooldown * 1000;
    userCooldown.set(commandName, newExpirationTime);

    return [false, 0];
};

/**
 * Replies to the interaction making sure it's not deferred first.
 * @param content The content to return.
 * @param interaction ChatInputCommandInteraction
 */
export async function interactionErrorReply(content: string, interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(
            { 
                content: content,
                flags:MessageFlags.Ephemeral
            }
        );
    } else {
        await interaction.reply(
            {
                content: content,
                flags:MessageFlags.Ephemeral
            }
        );
    };
};