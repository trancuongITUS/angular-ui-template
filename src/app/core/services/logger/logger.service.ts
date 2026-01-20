import { Injectable, inject } from '@angular/core';
import { EnvironmentService } from '../environment.service';
import { LogLevel } from '@environments/environment.interface';
import { LogContext, LogEntry, createLogEntry, formatLogMessage, getConsoleMethod, LOG_LEVEL_PRIORITY } from './log-formatter';

/**
 * Logger service that respects environment configuration.
 * Provides structured logging with context support for better debugging and monitoring.
 */
@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    private envService = inject(EnvironmentService);
    private context?: LogContext;

    /**
     * Logs a debug message if the current log level allows it.
     */
    debug(message: string, ...args: unknown[]): void {
        if (this.shouldLog('debug')) {
            this.log('debug', message, args);
        }
    }

    /**
     * Logs an info message if the current log level allows it.
     */
    info(message: string, ...args: unknown[]): void {
        if (this.shouldLog('info')) {
            this.log('info', message, args);
        }
    }

    /**
     * Logs a warning message if the current log level allows it.
     */
    warn(message: string, ...args: unknown[]): void {
        if (this.shouldLog('warn')) {
            this.log('warn', message, args);
        }
    }

    /**
     * Logs an error message if the current log level allows it.
     */
    error(message: string, ...args: unknown[]): void {
        if (this.shouldLog('error')) {
            this.log('error', message, args);
        }
    }

    /**
     * Creates a new logger instance with specific context.
     * Uses Object.create() to avoid triggering inject() outside Angular's DI context.
     */
    withContext(context: LogContext): LoggerService {
        const logger = Object.create(LoggerService.prototype) as LoggerService;
        logger.envService = this.envService;
        logger.context = { ...this.context, ...context };
        return logger;
    }

    /**
     * Groups related log messages together.
     */
    group(label: string, callback: () => void): void {
        if (this.shouldLog('debug')) {
            console.group(`[GROUP] ${label}`);
            try {
                callback();
            } finally {
                console.groupEnd();
            }
        }
    }

    /**
     * Groups related log messages together (collapsed by default).
     */
    groupCollapsed(label: string, callback: () => void): void {
        if (this.shouldLog('debug')) {
            console.groupCollapsed(`[GROUP] ${label}`);
            try {
                callback();
            } finally {
                console.groupEnd();
            }
        }
    }

    /**
     * Logs a table of data (useful for arrays and objects).
     */
    table(data: unknown, columns?: string[]): void {
        if (this.shouldLog('debug')) {
            columns ? console.table(data, columns) : console.table(data);
        }
    }

    /**
     * Starts a performance timer.
     */
    time(label: string): () => void {
        if (this.shouldLog('debug')) {
            console.time(label);
            return () => console.timeEnd(label);
        }
        return () => {};
    }

    /**
     * Logs execution time of an async operation.
     */
    async measureAsync<T>(label: string, operation: () => Promise<T>): Promise<T> {
        const endTimer = this.time(label);
        try {
            return await operation();
        } finally {
            endTimer();
        }
    }

    /**
     * Logs execution time of a synchronous operation.
     */
    measure<T>(label: string, operation: () => T): T {
        const endTimer = this.time(label);
        try {
            return operation();
        } finally {
            endTimer();
        }
    }

    /**
     * Traces function execution (useful for debugging).
     */
    trace(message: string, ...args: unknown[]): void {
        if (this.shouldLog('debug')) {
            console.trace(`[TRACE] ${message}`, ...args);
        }
    }

    /**
     * Clears the console.
     */
    clear(): void {
        if (!this.envService.isProduction) {
            console.clear();
        }
    }

    /**
     * Core logging method with structured logging support.
     */
    private log(level: LogLevel, message: string, args: unknown[]): void {
        const entry = createLogEntry(level, message, args, this.context);
        const formattedMessage = formatLogMessage(entry);
        const consoleMethod = getConsoleMethod(level);

        args.length > 0 ? consoleMethod(formattedMessage, ...args) : consoleMethod(formattedMessage);

        if (!this.envService.isProduction && this.context) {
            console.debug('Log Entry:', entry);
        }
    }

    /**
     * Determines if a message should be logged based on the current log level.
     */
    private shouldLog(level: LogLevel): boolean {
        const currentLevel = this.envService.logLevel as LogLevel;
        return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
    }
}
