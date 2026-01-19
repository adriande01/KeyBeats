class Beat {

    /**
     * Create a new Beat instance
     * @param {object} data - Beat data
     */
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.songId = data.songId || '';
        this.timestamp = typeof data.timestamp === 'number' ? data.timestamp : 0;
        this.keys = data.keys || '';
        this.order = typeof data.order === 'number' ? data.order : 0;
    }

    /**
     * Generate unique beat ID
     * @returns {string} Unique beat ID
     */
    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return 'beat_' + timestamp + '_' + random;
    }

    /**
     * Convert beat to plain object for JSON storage
     * @returns {object} Beat data as plain object
     */
    toJSON() {
        return {
            id: this.id,
            songId: this.songId,
            timestamp: this.timestamp,
            keys: this.keys,
            order: this.order
        };
    }

    /**
     * Create Beat instance from plain object
     * @param {object} data - Plain beat data
     * @returns {Beat} New Beat instance
     */
    static fromJSON(data) {
        return new Beat(data);
    }

    /**
     * Get beat display info for game screen
     * @returns {object} Beat display data
     */
    getDisplayInfo() {
        return {
            id: this.id,
            keys: this.keys,
            timestamp: this.timestamp
        };
    }

    /**
     * Check if this beat should appear on screen based on current audio time
     * Uses ±0.5 seconds window as defined in game rules
     *
     * @param {number} currentTime - Current audio time in seconds
     * @returns {boolean} True if beat should be visible
     */
    isActive(currentTime) {
        return Math.abs(currentTime - this.timestamp) < 0.5;
    }

    /**
     * Check if a key combination matches this beat
     * @param {string} pressedKeys - Keys pressed by the player (e.g. "A" or "Ctrl+D")
     * @returns {boolean} True if correct keys were pressed
     */
    matchesKeys(pressedKeys) {
        return this.keys === pressedKeys;
    }

    /**
     * Update beat timestamp
     * @param {number} newTimestamp - New timestamp in seconds
     */
    updateTimestamp(newTimestamp) {
        this.timestamp = newTimestamp;
    }

    /**
     * Update beat keys
     * @param {string} newKeys - New key combination
     */
    updateKeys(newKeys) {
        this.keys = newKeys;
    }

    /**
     * Update beat order in the song
     * @param {number} newOrder - New sequential order
     */
    updateOrder(newOrder) {
        this.order = newOrder;
    }

    /**
     * Get simple debug info (useful for testing in console)
     * @returns {string}
     */
    toString() {
        return `Beat ${this.id} | time: ${this.timestamp}s | keys: ${this.keys} | order: ${this.order}`;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Beat;
}
