class Song {

    /**
     * Create a new Song instance
     * @param {object} data - Song data
     */
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.author = data.author || '';
        this.duration = data.duration || '00:00'; // MM:SS
        this.maxStars = data.maxStars || 0;
        this.coverImage = data.coverImage || '';
        this.audioFile = data.audioFile || '';
        this.beats = Array.isArray(data.beats) ? data.beats : [];
    }

    /**
     * Generate unique song ID
     * @returns {string} Unique song ID
     */
    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        return 'song_' + timestamp + '_' + random;
    }

    /**
     * Convert song to plain object for JSON storage
     * @returns {object} Song data as plain object
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            author: this.author,
            duration: this.duration,
            maxStars: this.maxStars,
            coverImage: this.coverImage,
            audioFile: this.audioFile,
            beats: this.beats
        };
    }

    /**
     * Create Song instance from plain object
     * @param {object} data - Plain song data
     * @returns {Song} New Song instance
     */
    static fromJSON(data) {
        return new Song(data);
    }

    /**
     * Get basic info for the song card in main.html (Osu-style list)
     * @returns {object} Song display data for the index
     */
    getCardInfo() {
        return {
            id: this.id,
            name: this.name,
            author: this.author,
            maxStars: this.maxStars,
            coverImage: this.coverImage
        };
    }

    /**
     * Get data needed for the details panel in main.html
     * @returns {object} Song detail data
     */
    getDetailInfo() {
        return {
            id: this.id,
            name: this.name,
            author: this.author,
            duration: this.duration,
            maxStars: this.maxStars,
            coverImage: this.coverImage,
            audioFile: this.audioFile
        };
    }

    /**
     * Get all beats of the song (for game.html)
     * @returns {array} Array of beats
     */
    getBeats() {
        return this.beats;
    }

    /**
     * Get beats ordered by their "order" field
     * @returns {array} Ordered beats array
     */
    getOrderedBeats() {
        return this.beats.slice().sort((a, b) => a.order - b.order);
    }

    /**
     * Get a beat by its id
     * @param {string} beatId
     * @returns {object|null} Beat object or null if not found
     */
    getBeatById(beatId) {
        return this.beats.find(beat => beat.id === beatId) || null;
    }

    /**
     * Add a beat to the song
     * (No validation here; validation is handled elsewhere)
     * @param {object} beat - Beat object
     */
    addBeat(beat) {
        this.beats.push(beat);
    }

    /**
     * Get a simple star display model for UI
     * Useful for main.html (song cards)
     *
     * @param {number} starsEarned - Stars earned by the user for this song
     * @returns {object} Filled and empty stars count
     */
    getStarDisplay(starsEarned) {
        const filled = Math.max(0, Math.min(starsEarned, this.maxStars));
        const empty = Math.max(0, this.maxStars - filled);

        return {
            filledStars: filled,
            emptyStars: empty,
            maxStars: this.maxStars
        };
    }

    /**
     * Check if this song has any beats
     * @returns {boolean}
     */
    hasBeats() {
        return this.beats.length > 0;
    }

    /**
     * Get total number of beats in the song
     * @returns {number}
     */
    getBeatCount() {
        return this.beats.length;
    }

}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Song;
}
