export default class Log {
    static #verboseLevels = {
        MUTE: 0,
        ERROR: 1,
        WARN: 2,
        INFO: 3,
        DEBUG: 4
    };

    // Get default level from cookie, localStorage, or fallback to 'INFO'
    static #currentVerbose = Log.#getStoredVerboseLevel() || 'MUTE';

    /**
     * Get stored verbose level from cookie or localStorage
     * @returns {string|null} Stored level or null if not found
     */
    static #getStoredVerboseLevel() {
        // Try to get from cookie first
        const cookieValue = Log.#getCookie('log_verbose');
        if (cookieValue && Log.#verboseLevels[cookieValue.toUpperCase()]) {
            return cookieValue.toUpperCase();
        }

        // Fallback to localStorage
        try {
            const storedValue = localStorage.getItem('log_verbose');
            if (storedValue && Log.#verboseLevels[storedValue.toUpperCase()]) {
                return storedValue.toUpperCase();
            }
        } catch (e) {
            // localStorage might not be available (e.g., in Node.js)
            Log.debug('localStorage not available for verbose level storage');
        }

        return null;
    }

    /**
     * Get cookie value by name
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value or null
     */
    static #getCookie(name) {
        if (typeof document === 'undefined') return null;

        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    /**
     * Set cookie with verbose level
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Expiration in days
     */
    static #setCookie(name, value, days = 30) {
        if (typeof document === 'undefined') return;

        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
    }

    /**
     * Set the verbose level and persist to storage
     * @param {string} level - One of: MUTE, ERROR, WARN, INFO, DEBUG
     * @param {boolean} persist - Whether to save to cookie/localStorage
     */
    static setLevel(level, persist = true) {
        const upperLevel = level?.toUpperCase();

        if (Object.keys(this.#verboseLevels).includes(upperLevel)) {
            this.#currentVerbose = upperLevel;

            if (persist) {
                // Try cookie first
                try {
                    this.#setCookie('log_verbose', upperLevel);
                } catch (e) {
                    // Fallback to localStorage if cookies fail
                    try {
                        localStorage.setItem('log_verbose', upperLevel);
                    } catch (storageError) {
                        this.debug('Could not persist log level to storage');
                    }
                }
            }

            this.debug(`Log level set to: ${upperLevel}${persist ? ' (persisted)' : ''}`);
        } else {
            this.error(`Invalid log level: ${level}. Available levels: ${Object.keys(this.#verboseLevels).join(', ')}`);
        }
    }

    /**
     * Clear stored verbose level from all storage mechanisms
     */
    static clearStoredLevel() {
        // Clear cookie
        if (typeof document !== 'undefined') {
            document.cookie = 'log_verbose=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        }

        // Clear localStorage
        try {
            localStorage.removeItem('log_verbose');
        } catch (e) {
            // Ignore errors
        }

        this.debug('Stored log level cleared');
    }

    /**
     * Get current verbose level
     * @returns {string} Current verbose level
     */
    static getLevel() {
        return this.#currentVerbose;
    }

    /**
     * Get all available verbose levels
     * @returns {string[]} Array of available levels
     */
    static getLevels() {
        return Object.keys(this.#verboseLevels);
    }

    /**
     * Check if logging should occur for given level
     * @param {string} level - Level to check
     * @returns {boolean} True if should log
     */
    static #shouldLog(level) {
        return this.#verboseLevels[level] <= this.#verboseLevels[this.#currentVerbose];
    }

    /**
     * Check if a specific level is enabled
     * @param {string} level - Level to check
     * @returns {boolean} True if level is enabled
     */
    static isEnabled(level) {
        return this.#shouldLog(level);
    }

    /**
     * Error logging - always shows unless MUTE
     */
    static error(...args) {
        if (this.#shouldLog('ERROR')) {
            console.error('❌ ERROR:', ...args);
        }
    }

    /**
     * Warning logging
     */
    static warn(...args) {
        if (this.#shouldLog('WARN')) {
            console.warn('⚠️ WARN:', ...args);
        }
    }

    /**
     * Info logging (default level)
     */
    static info(...args) {
        if (this.#shouldLog('INFO')) {
            console.log('ℹ️ INFO:', ...args);
        }
    }

    /**
     * Alias for info() for backward compatibility
     */
    static log(...args) {
        this.info(...args);
    }

    /**
     * Debug logging - only shows in DEBUG mode
     */
    static debug(...args) {
        if (this.#shouldLog('DEBUG')) {
            console.debug('🐛 DEBUG:', ...args);
        }
    }
    static debugNoSlug(...args) {
        if (this.#shouldLog('DEBUG')) {
            console.debug(...args);
        }
    }

    static chessBoard(squares, title = 'Chess Board') {
        if (!this.#shouldLog('INFO')) return;

        const pieceSymbols = {
            'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
            'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙',
            '': '·'
        };

        // Styled output
        this.debug(`\n🎯 ${title}`);
        this.debugNoSlug('  ┌─────────────────┐');
        this.debugNoSlug('  │ a b c d e f g h │');
        this.debugNoSlug('  ├─────────────────┤');

        for (let row = 0; row < 8; row++) {
            let rowStr = `${8 - row} │ `;
            for (let col = 0; col < 8; col++) {
                const index = row * 8 + col;
                const piece = squares[index] || '';
                const symbol = pieceSymbols[piece] || pieceSymbols[''];
                // Add color for better readability
                rowStr += `${symbol} `;
            }
            this.debugNoSlug(rowStr + `│ ${8 - row}`);
        }

        this.debugNoSlug('  ├─────────────────┤');
        this.debugNoSlug('  │ a b c d e f g h │');
        this.debugNoSlug('  └─────────────────┘\n');
    }

    /**
     * Performance timing utility
     */
    static time(label) {
        if (this.#shouldLog('DEBUG')) {
            console.time(`⏱️ ${label}`);
            return () => console.timeEnd(`⏱️ ${label}`);
        }
        return () => { }; // No-op if not debugging
    }

    /**
     * Group related logs together
     */
    static group(label, level = 'INFO') {
        if (this.#shouldLog(level)) {
            console.group(`📁 ${label}`);
            return () => console.groupEnd();
        }
        return () => { }; // No-op if level not enabled
    }

    /**
     * Table logging - only shows in DEBUG mode
     */
    static table(...args) {
        if (this.#shouldLog('DEBUG')) {
            console.table(...args);
        }
    }

    /**
     * Trace logging - only shows in DEBUG mode
     */
    static trace(...args) {
        if (this.#shouldLog('DEBUG')) {
            console.trace('🔍 TRACE:', ...args);
        }
    }
}

// Optional: Auto-initialize from URL parameter (e.g., ?debug=true)
if (typeof URLSearchParams !== 'undefined' && typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('debug')) {
        Log.setLevel('DEBUG', false); // Don't persist URL-based settings
    } else if (urlParams.has('log')) {
        Log.setLevel(ulParams.get('log'), false);
    }
}

// Export singleton instance for easier importing
export const log = Log;