// src\Utils\Logger.ts

import { BotClient } from "@/client/botClient";

/**
 * ANSI color codes for formatting terminal output.
 */
const Colors = {
    Reset: "\x1b[0m", // INTERNAL
    Bright: "\x1b[1m", // INTERNAL
    Dim: "\x1b[2m", // INTERNAL
    FgRed: "\x1b[31m", // IN USE
    FgGreen: "\x1b[32m", // IN USE
    FgYellow: "\x1b[33m", // IN USE
    FgBlue: "\x1b[34m", // IN USE
    FgMagenta: "\x1b[35m", // IN USE
    FgCyan: "\x1b[36m", // IN USE
    FgWhite: "\x1b[37m",
    BgRed: "\x1b[41m",
};

/**
 * Standardizes log output with timestamps, categories, and colors.
 */
export class Logger {
    private static isDev = true;
    private static client: BotClient | null = null;

    public static init(client: BotClient) {
        Logger.client = client;
    };

    public static setEnvironment(env: boolean) {
        Logger.isDev = !env
    };

    private static format(tag: string, color: string, message: any, ...args: any[]) {
        const timestamp = new Date().toLocaleDateString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const output = `${Colors.Dim}[${timestamp}]${Colors.Reset} ${color}${Colors.Bright}[${tag}]${Colors.Reset} ${message}`;

        console.log(args.length > 0 ? '\n' + output + '\n' + args.join('\n') : output);
    };

    public static info(message: any, ...args: any[]) {
        Logger.format('INFO', Colors.FgCyan, message, ...args);
    };

    public static success(message: any, ...args: any[]) {
        Logger.format('SUCCESS', Colors.FgGreen, message, ...args);
    };

    public static warn(message: any, ...args: any[]) {
        Logger.format('WARN', Colors.FgYellow, message, ...args);
    };

    public static error(message: any, ...args: any[]) {
        Logger.format('ERROR', Colors.FgRed, message, ...args);
    };

    public static debug(message: any, ...args: any[]) {
        if (Logger.isDev) {
            Logger.format('DEBUG', Colors.FgMagenta, message, ...args);
        };
    };
};