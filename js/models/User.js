class User {
    
    /**
     * Create a new User instance
     * @param {object} data - User data
     */
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.nickname = data.nickname || '';
        this.email = data.email || '';
        this.password = data.password || '';
        this.avatar = data.avatar || '';
        this.level = data.level || 0;
        this.completedSongs = data.completedSongs || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
    
    /**
     * Generate unique user ID
     * @returns {string} Unique user ID
     */
    generateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        return 'user_' + timestamp + '_' + random;
    }
    
    /**
     * Convert user to plain object for JSON storage
     * @returns {object} User data as plain object
     */
    toJSON() {
        return {
            id: this.id,
            nickname: this.nickname,
            email: this.email,
            password: this.password,
            avatar: this.avatar,
            level: this.level,
            completedSongs: this.completedSongs,
            createdAt: this.createdAt
        };
    }
    
    /**
     * Create User instance from plain object
     * @param {object} data - Plain user data
     * @returns {User} New User instance
     */
    static fromJSON(data) {
        return new User(data);
    }
    
    /**
     * Update user level based on total stars earned
     * @param {number} totalStars - Total stars from all completed songs
     */
    updateLevel(totalStars) {
        this.level = totalStars;
    }
    
    /**
     * Update completed songs count
     * @param {number} count - Number of songs with at least 1 star
     */
    updateCompletedSongs(count) {
        this.completedSongs = count;
    }
    
    /**
     * Update user nickname
     * @param {string} newNickname - New nickname
     */
    updateNickname(newNickname) {
        this.nickname = newNickname;
    }
    
    /**
     * Update user email
     * @param {string} newEmail - New email
     */
    updateEmail(newEmail) {
        this.email = newEmail;
    }
    
    /**
     * Update user password
     * @param {string} newPassword - New password
     */
    updatePassword(newPassword) {
        this.password = newPassword;
    }
    
    /**
     * Update user avatar
     * @param {string} newAvatar - New avatar (e.g., "av0", "av1")
     */
    updateAvatar(newAvatar) {
        this.avatar = newAvatar;
    }
    
    /**
     * Get user display info (for session/header)
     * @returns {object} User display data
     */
    getDisplayInfo() {
        return {
            id: this.id,
            nickname: this.nickname,
            avatar: this.avatar,
            level: this.level
        };
    }
    
    /**
     * Get user profile data (for profile page)
     * @returns {object} User profile data
     */
    getProfileData() {
        return {
            id: this.id,
            nickname: this.nickname,
            email: this.email,
            avatar: this.avatar,
            level: this.level,
            completedSongs: this.completedSongs,
            createdAt: this.createdAt
        };
    }
    
    /**
     * Check if password matches
     * @param {string} password - Password to check
     * @returns {boolean} True if password matches
     */
    verifyPassword(password) {
        return this.password === password;
    }
    
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = User;
}