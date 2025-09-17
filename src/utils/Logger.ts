import { ConsoleBoard } from "./ConsoleBoard";

export enum LogLevel {
    MUTE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4
}

export class Logger {
    private static verboseLevels = LogLevel;
    private static currentVerbose = Logger.getStoredVerboseLevel() || LogLevel.MUTE;

    private static getStoredVerboseLevel(): LogLevel | null {
        const cookieValue = Logger.getCookie('log_verbose')?.toUpperCase();
        if (cookieValue &&
            LogLevel.hasOwnProperty(cookieValue)) {
            return LogLevel[cookieValue as keyof typeof LogLevel];
        }

        try {
            const storedValue = localStorage.getItem('log_verbose')?.toUpperCase();
            if (storedValue && Logger.hasOwnProperty(storedValue)) {
                return LogLevel[storedValue as keyof typeof LogLevel];
            }
        } catch (e) {
            Logger.debug('localStorage not available for verbose level storage');
        }

        return null;
    }

    private static getCookie(name: string): string | null {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop()?.split(';').shift() || null;
        }
        return null;
    }

    private static setCookie(name: string, value: string, days = 30): void {
        if (typeof document === 'undefined') return;
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
    }
    static setLevel(level: LogLevel, persist = true) {

        if (Object.keys(this.verboseLevels).includes(level.toString())) {
            this.currentVerbose = level;

            if (persist) {
                try {
                    this.setCookie('log_verbose', level.toString());
                } catch (e) {
                    try {
                        localStorage.setItem('log_verbose', level.toString());
                    } catch (storageError) {
                        this.debug('Could not persist log level to storage');
                    }
                }
            }

            this.debug(`Log level set to: ${level}${persist ? ' (persisted)' : ''}`);
        } else {
            this.error(`Invalid log level: ${level}. Available levels: ${Object.keys(this.verboseLevels).join(', ')}`);
        }
    }

    static error(...args: any[]) {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error('❌ ERROR:', ...args);
        }
    }

    static warn(...args: any[]) {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn('⚠️ WARN:', ...args);
        }
    }

    static info(...args: any[]) {
        if (this.shouldLog(LogLevel.INFO)) {
            console.log('ℹ️ INFO:', ...args);
        }
    }

    static debug(...args: any[]) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug('🐛 DEBUG:', ...args);
        }
    }

    static debugNoSlug(...args: any[]) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(...args);
        }
    }

    public static shouldLog(level: LogLevel): boolean {
        return level <= this.currentVerbose;
    }

    public static logBoard(){
        ConsoleBoard.log();
    }
}