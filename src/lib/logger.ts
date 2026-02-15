"use client";

/**
 * Professional structured logger for Lumina.
 * Supports levels, context, and potential external integration.
 */
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
    message: string;
    level: LogLevel;
    context?: any;
    timestamp: string;
}

class Logger {
    private isClient: boolean;

    constructor() {
        this.isClient = typeof window !== "undefined";
    }

    private format(level: LogLevel, message: string, context?: any): LogPayload {
        return {
            message,
            level,
            context,
            timestamp: new Date().toISOString(),
        };
    }

    private log(payload: LogPayload) {
        const { level, message, context, timestamp } = payload;
        const color = {
            info: "\u001b[32m", // Green
            warn: "\u001b[33m", // Yellow
            error: "\u001b[31m", // Red
            debug: "\u001b[34m", // Blue
            reset: "\u001b[0m",
        };

        if (this.isClient) {
            const styles = {
                info: "color: #10b981; font-weight: bold;",
                warn: "color: #f59e0b; font-weight: bold;",
                error: "color: #ef4444; font-weight: bold;",
                debug: "color: #3b82f6; font-weight: bold;",
            };
            console.log(`%c[${level.toUpperCase()}] %c${timestamp} %c${message}`, styles[level], "color: #6b7280", "color: inherit", context || "");
        } else {
            console.log(`[${level.toUpperCase()}] ${timestamp} ${message}`, context || "");
        }
    }

    info(message: string, context?: any) {
        this.log(this.format("info", message, context));
    }

    warn(message: string, context?: any) {
        this.log(this.format("warn", message, context));
    }

    error(message: string, context?: any) {
        this.log(this.format("error", message, context));
    }

    debug(message: string, context?: any) {
        if (process.env.NODE_ENV === "development") {
            this.log(this.format("debug", message, context));
        }
    }
}

export const logger = new Logger();
