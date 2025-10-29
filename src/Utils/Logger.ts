// src\Utils\Logger.ts

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

    /**
     * Sets the logging environement status.
     * @param env True if the environement is production (debug OFFà.)
     */
    public static setEnvironment(env: boolean) {
        Logger.isDev = !env
    };

    /**
     * Formats the log message with a timestamp and category tag.
     * @param tag The category tag (e.g., INFO, ERROR).
     * @param color the ANSI color code for the tag
     * @param message the message to log.
     * @param args Additional objects to log (e.g., error objects).
     */
    private static format(tag: string, color: string, message: any, ...args: any[]) {
        const timestamp = new Date().toLocaleDateString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const output = `${Colors.Dim}[${timestamp}]${Colors.Reset} ${color}${Colors.Bright}[${tag}]${Colors.Reset} ${message}`;

        console.log(output, ...args);
    };

    /**
     * Logs general information messages (White).
     * @param message 
     * @param args 
     */
    public static info(message: any, ...args: any[]) {
        Logger.format('INFO', Colors.FgCyan, message, ...args);
    };

    /**
     * Logs successfull actions (Green).
     * @param message 
     * @param args 
     */
    public static success(message: any, ...args: any[]) {
        Logger.format('SUCCESS', Colors.FgGreen, message, ...args);
    };

    /**
     * Logs warnings (Yellow).
     * @param message 
     * @param args 
     */
    public static warn(message: any, ...args: any[]) {
        Logger.format('WARN', Colors.FgYellow, message, ...args);
    };

    /**
     * Logs errors and exceptions (Red).
     * @param message 
     * @param args 
     */
    public static error(message: any, ...args: any[]) {
        Logger.format('ERROR', Colors.FgRed, message, ...args);
    };

    /**
     * Logs debugging messages (Magenta) - Can be toggled off for production.
     * @param message 
     * @param args 
     */
    public static debug(message: any, ...args: any[]) {
        if (Logger.isDev) {
            Logger.format('DEBUG', Colors.FgMagenta, message, ...args);
        };
    };

    /**
     * Logs messages related to the Event Handler loading and Registration (Blue)
     * @param message 
     * @param args 
     */
    public static event(message: any, ...args: any[]) {
        Logger.format('EVENT', Colors.FgBlue, message, ...args);
    };

    /**
     * Logs messages related to the Command Handler loading and Registration (Yellow)
     * @param message 
     * @param args 
     */
    public static command(message: any, ...args: any[]) {
        Logger.format('COMMAND', Colors.FgYellow, message, ...args);
    };
};