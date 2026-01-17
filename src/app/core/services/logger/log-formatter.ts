import { LogLevel } from '@environments/environment.interface';

/**
 * Log context for structured logging.
 */
export interface LogContext {
    readonly component?: string;
    readonly action?: string;
    readonly userId?: string;
    readonly sessionId?: string;
    readonly metadata?: Record<string, unknown>;
}

/**
 * Log entry interface for structured logging.
 */
export interface LogEntry {
    readonly level: LogLevel;
    readonly message: string;
    readonly timestamp: string;
    readonly context?: LogContext;
    readonly data?: unknown[];
}

/**
 * Creates a structured log entry.
 */
export function createLogEntry(level: LogLevel, message: string, data: unknown[], context?: LogContext): LogEntry {
    return {
        level,
        message,
        timestamp: new Date().toISOString(),
        context,
        data: data.length > 0 ? data : undefined
    };
}

/**
 * Formats log message with level and context.
 */
export function formatLogMessage(entry: LogEntry): string {
    const parts: string[] = [`[${entry.level.toUpperCase()}]`, `[${formatTimestamp(entry.timestamp)}]`];

    if (entry.context?.component) {
        parts.push(`[${entry.context.component}]`);
    }

    if (entry.context?.action) {
        parts.push(`[${entry.context.action}]`);
    }

    parts.push(entry.message);

    return parts.join(' ');
}

/**
 * Formats timestamp for display.
 */
export function formatTimestamp(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3
    });
}

/**
 * Log level priority for filtering.
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};

/**
 * Gets the appropriate console method for the log level.
 */
export function getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
        case 'debug':
            return console.debug.bind(console);
        case 'info':
            return console.info.bind(console);
        case 'warn':
            return console.warn.bind(console);
        case 'error':
            return console.error.bind(console);
        default:
            return console.log.bind(console);
    }
}
