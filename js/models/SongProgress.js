class SongProgress {

    /**
     * Create a new SongProgress instance
     * @param {object} data - Song progress data
     */
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.userId = data.userId || '';
        this.songId = data.songId || '';
        this.starsEarned = typeof data.starsEarned === 'number' ? data.starsEarned : 0;
        this.lastPlayed = data.lastPlayed || new Date().toISOString();
        this.attempts = typeof data.attempts === 'number' ? data.attempts : 0;
    }

    /**
     * Generate unique progress ID
     * @returns {string} Unique progress ID
     */
    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return 'progress_' + timestamp + '_' + random;
    }

    /**
     * Convert progress to plain object for JSON storage
     * @returns {object} Song progress data as plain object
     */
    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            songId: this.songId,
            starsEarned: this.starsEarned,
            lastPlayed: this.lastPlayed,
            attempts: this.attempts
        };
    }

    /**
     * Create SongProgress instance from plain object
     * @param {object} data - Plain progress data
     * @returns {SongProgress} New SongProgress instance
     */
    static fromJSON(data) {
        return new SongProgress(data);
    }

    /**
     * Update stars earned.
     * Stars only increase, never decrease.
     * @param {number} newStars - New stars obtained in latest attempt
     * @returns {boolean} True if progress was updated
     */
    updateStars(newStars) {
        if (newStars > this.starsEarned) {
            this.starsEarned = newStars;
            this.updateLastPlayed();
            return true;
        }
        return false;
    }

    /**
     * Increase number of attempts by 1
     */
    incrementAttempts() {
        this.attempts += 1;
        this.updateLastPlayed();
    }

    /**
     * Update last played timestamp to current time
     */
    updateLastPlayed() {
        this.lastPlayed = new Date().toISOString();
    }

    /**
     * Check if this song is considered completed
     * (business rule: only completed if at least 1 star)
     * @returns {boolean}
     */
    isCompleted() {
        return this.starsEarned >= 1;
    }

    /**
     * Get progress info for main page (song cards)
     * @returns {object}
     */
    getCardProgress() {
        return {
            songId: this.songId,
            starsEarned: this.starsEarned
        };
    }

    /**
     * Get detailed progress info for profile page
     * @returns {object}
     */
    getProfileProgress() {
        return {
            id: this.id,
            songId: this.songId,
            starsEarned: this.starsEarned,
            lastPlayed: this.lastPlayed,
            attempts: this.attempts
        };
    }

    /**
     * Reset progress (useful if starsEarned becomes 0)
     */
    resetProgress() {
        this.starsEarned = 0;
        this.attempts = 0;
        this.updateLastPlayed();
    }

}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SongProgress;
}
