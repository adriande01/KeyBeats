

// ============================================================================
// GLOBAL VARIABLES
// ============================================================================

let currentUser = null; // Current logged-in user object
let allSongs = []; // Array of all available songs
let userProgress = []; // Array of user's song progress
let selectedSongId = null; // Currently selected song ID

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

//Hola adri sepio

/**
 * Get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(";").shift();
    }
    return null;
}

/**
 * Delete cookie by name
 * @param {string} name - Cookie name
 */
function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

/**
 * Check if user is logged in (has valid session cookie)
 * Redirects to login.html if not logged in
 */
function checkSession() {
    const sessionCookie = getCookie("keybeats_session");

    if (!sessionCookie) {
        // No session found, redirect to login
        window.location.href = "login.html";
        return;
    }

    try {
        // Try to parse as JSON first (if it's an object)
        let userId;

        try {
            const sessionData = JSON.parse(decodeURIComponent(sessionCookie));
            userId = sessionData.userId;
        } catch (e) {
            // If parsing fails, assume it's just the userId string
            userId = sessionCookie;
        }

        if (!userId) {
            // Invalid session data, redirect to login
            window.location.href = "login.html";
            return;
        }

        // Load full user data from server
        loadUserData(userId);
    } catch (error) {
        console.error("Error parsing session cookie:", error);
        window.location.href = "login.html";
    }
}

// ============================================================================
// GSAP FRACTAL LOADING ANIMATION
// ============================================================================

/**
 * Initialize and play GSAP fractal animation on page load
 * Animation simulates entering a musical fractal (like AirPods animation)
 */
function playLoadingAnimation() {
    const fractalCircle = $("#fractalCircle");
    const loadingText = $("#loadingText");
    const loadingAnimation = $("#loadingAnimation");
    const backgroundLayer = $("#backgroundLayer");
    const mainContainer = $("#mainContainer");

    // GSAP Timeline for animation sequence
    const timeline = gsap.timeline({
        onComplete: function() {
            // Hide loading animation
            loadingAnimation.fadeOut(300, function() {
                $(this).remove();
            });

            // Show main content
            backgroundLayer.fadeIn(500);
            mainContainer.fadeIn(500);
        },
    });

    // Step 1: Scale up the circle from small to large (fractal expansion)
    timeline.to(fractalCircle[0], {
        attr: { r: 800 }, // Expand radius to cover screen
        duration: 1.5,
        ease: "power2.inOut",
    });

    // Step 2: Fade out the text during expansion
    timeline.to(
        loadingText[0], {
            opacity: 0,
            duration: 0.5,
            ease: "power1.out",
        },
        "-=1",
    );

    // Step 3: Add pulsing effect (simulate musical beats)
    timeline.to(
        fractalCircle[0], {
            attr: { r: 850 },
            duration: 0.3,
            yoyo: true,
            repeat: 2,
            ease: "sine.inOut",
        },
        "-=0.5",
    );

    // Step 4: Final expansion and fade
    timeline.to(fractalCircle[0], {
        attr: { r: 1200 },
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
    });
}

// ============================================================================
// DATA LOADING (AJAX)
// ============================================================================

/**
 * Load user data from server
 * @param {string} userId - User ID
 */
function loadUserData(userId) {
    $.ajax({
        url: "api/get-user.php",
        type: "POST",
        data: { userId: userId },
        dataType: "json",
        success: function(response) {
            if (response.success) {
                // Create User instance from response
                currentUser = User.fromJSON(response.user);
                userProgress = response.user.progress || [];

                // Update header with user info
                updateHeader();

                // Load songs after user data is loaded
                loadSongs();
            } else {
                alert(i18next.t('errors.loadUserData')); // i18n support added
                window.location.href = "login.html";
            }
        },
        error: function(xhr, status, error) {
            console.error("Error loading user data:", error);
            alert(i18next.t('errors.loadUserDataError')); // i18n support added
            window.location.href = "login.html";
        },
    });
}

/**
 * Load all songs from server
 */
function loadSongs() {
    // Show loading overlay
    $("#loadingOverlay").fadeIn(200);

    $.ajax({
        url: "api/get-songs.php",
        type: "GET",
        dataType: "json",
        success: function(response) {
            if (response.success && Array.isArray(response.songs)) {
                // Convert plain objects to Song instances
                allSongs = response.songs.map((songData) => Song.fromJSON(songData));

                // Render song cards
                renderSongCards();

                // Hide loading overlay
                $("#loadingOverlay").fadeOut(200);
            } else {
                alert(i18next.t('errors.loadSongsError')); // i18n support added
                $("#loadingOverlay").fadeOut(200);
            }
        },
        error: function(xhr, status, error) {
            console.error("Error loading songs:", error);
            alert(i18next.t('errors.loadSongs')); // i18n support added
            $("#loadingOverlay").fadeOut(200);
        },
    });
}


// ============================================================================
// HEADER COMPONENT
// ============================================================================

/**
 * Update header with user info (avatar, level, nickname)
 */
function updateHeader() {
    if (!currentUser) return;

    const displayInfo = currentUser.getDisplayInfo();

    // Update avatar image
    $("#headerAvatar").attr("src", `assets/avatars/${displayInfo.avatar}.png`);
    $("#headerAvatar").attr("alt", `${displayInfo.nickname}'s avatar`);

    // Update level (total stars)
    $("#levelNumber").text(displayInfo.level);
}

// ============================================================================
// SONG CARDS RENDERING
// ============================================================================

/**
 * Render all song cards in the song container
 */
function renderSongCards() {
    const songContainer = $("#songContainer");
    songContainer.empty(); // Clear existing cards

    // Loop through all songs and create cards
    allSongs.forEach((song) => {
        const cardInfo = song.getCardInfo();
        const progress = getUserProgressForSong(song.id);
        const starsEarned = progress ? progress.starsEarned : 0;
        const starDisplay = song.getStarDisplay(starsEarned);

        // Create song card HTML
        const cardHtml = `
    <div class="song-card" data-song-id="${song.id}">
        <div class="song-card-inner">
            <!-- Song Info -->
            <div class="song-info">
                <h3 class="song-name">${cardInfo.name}</h3>
                <p class="song-author">${cardInfo.author}</p>
                <p class="song-duration">${song.duration}</p>
            </div>
            
            <!-- Song Stars (Progress) -->
            <div class="song-stars" data-stars-earned="${starsEarned}" data-max-stars="${cardInfo.maxStars}">
                ${generateStarsHTML(starDisplay.filledStars, starDisplay.emptyStars)}
            </div>
        </div>
    </div>
`;

        songContainer.append(cardHtml);
    });

    // Attach click handlers to song cards
    attachSongCardHandlers();
}

/**
 * Generate stars HTML (filled and empty stars)
 * @param {number} filled - Number of filled stars
 * @param {number} empty - Number of empty stars
 * @returns {string} HTML string with star icons
 */
function generateStarsHTML(filled, empty) {
    let html = "";

    // Add filled stars
    for (let i = 0; i < filled; i++) {
        html += '<i class="fas fa-star star-filled"></i>';
    }

    // Add empty stars
    for (let i = 0; i < empty; i++) {
        html += '<i class="far fa-star star-empty"></i>';
    }

    return html;
}

/**
 * Get user progress for a specific song
 * @param {string} songId - Song ID
 * @returns {object|null} Progress object or null if not found
 */
function getUserProgressForSong(songId) {
    return userProgress.find((prog) => prog.songId === songId) || null;
}

// ============================================================================
// SONG SELECTION LOGIC
// ============================================================================

/**
 * Attach click and hover handlers to song cards
 */
function attachSongCardHandlers() {
    $(".song-card").on("click", function() {
        handleSongCardClick($(this));
    });

    $(".song-card").on("mouseenter", function() {
        handleSongCardHover($(this), true);
    });

    $(".song-card").on("mouseleave", function() {
        handleSongCardHover($(this), false);
    });
}

/**
 * Handle song card click (select song and show details)
 * @param {jQuery} cardElement - Clicked card jQuery element
 */
function handleSongCardClick(cardElement) {
    const songId = cardElement.attr("data-song-id");

    // Remove 'selected' class from all cards
    $(".song-card").removeClass("selected");

    // Add 'selected' class to clicked card
    cardElement.addClass("selected");

    // Update selected song ID
    selectedSongId = songId;

    // Update details panel
    updateDetailsPanel(songId);
}

/**
 * Handle song card hover effect (expand/shrink)
 * @param {jQuery} cardElement - Hovered card jQuery element
 * @param {boolean} isEntering - True if mouse entering, false if leaving
 */
function handleSongCardHover(cardElement, isEntering) {
    if (isEntering) {
        cardElement.addClass("hovered");
        cardElement.css("z-index", 10); // que sobresalga sobre las demás
    } else {
        cardElement.removeClass("hovered");
        cardElement.css("z-index", ""); // reset
    }
}

// ============================================================================
// SONG DETAILS PANEL
// ============================================================================

/**
 * Update the details panel with selected song information
 * @param {string} songId - Selected song ID
 */
function updateDetailsPanel(songId) {
    const song = allSongs.find((s) => s.id === songId);

    if (!song) {
        console.error("Song not found:", songId);
        return;
    }

    const detailInfo = song.getDetailInfo();
    const progress = getUserProgressForSong(songId);
    const attempts = progress ? progress.attempts : 0;

    // Hide placeholder, show content
    $("#placeholderMessage").hide();
    $("#songDetailsContent").fadeIn(300);

    // Update detail fields (ONLY: NAME, DIFFICULTY, ATTEMPTS)
    $("#detailName").text(detailInfo.name);
    $("#detailAttempts").text(attempts);

    // Update difficulty stars using user progress (same logic as song cards)
    const starsEarned = progress ? progress.starsEarned : 0;
    const starDisplay = song.getStarDisplay(starsEarned);

    const difficultyHtml = generateStarsHTML(
        starDisplay.filledStars,
        starDisplay.emptyStars
    );

    $("#detailDifficulty")
        .html(difficultyHtml)
        .attr("data-stars-earned", starsEarned)
        .attr("data-max-stars", detailInfo.maxStars);
}

/**
 * Handle Play button click (redirect to game.html)
 */
function handlePlayButtonClick() {
    if (!selectedSongId) {
        alert(i18next.t('home.selectSongAlert')); // i18n support added
        return;
    }

    // Redirect to game page with song ID
    window.location.href = `game.html?songId=${selectedSongId}`;
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts() {
    $(document).on("keydown", function(e) {
        // Enter: Play selected song
        if (e.key === "Enter") {
            if (selectedSongId) {
                handlePlayButtonClick();
            }
        }

        // Arrow keys: Navigate through songs
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            navigateSongs(e.key === "ArrowDown" ? 1 : -1);
        }
    });
}

/**
 * Navigate through songs using arrow keys
 * @param {number} direction - 1 for down, -1 for up
 */
function navigateSongs(direction) {
    const songCards = $(".song-card");
    const currentIndex = songCards.index($(".song-card.selected"));

    let newIndex = currentIndex + direction;

    // Wrap around
    if (newIndex < 0) {
        newIndex = songCards.length - 1;
    } else if (newIndex >= songCards.length) {
        newIndex = 0;
    }

    // Click on the new card
    songCards.eq(newIndex).trigger("click");

    // Scroll to the selected card
    songCards.eq(newIndex)[0].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
    });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Header: Logo click (reload page)
    $(".logo-link").on("click", function(e) {
        e.preventDefault();
        window.location.href = "index.html";
    });

    // Header: Avatar click (go to profile)
    $("#userInfo").on("click", function(e) {
        window.location.href = "profile.html";
    });

    // Play button click
    $("#playBtn").on("click", handlePlayButtonClick);

    // Keyboard shortcuts
    handleKeyboardShortcuts();

    $("#logoutBtn").on("click", function(e) {
        e.stopPropagation(); // evita conflictos con otros clicks del header
        logout();
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the page on document ready
 */
$(document).ready(function() {
    // Step 1: Check session (redirects if not logged in)
    checkSession();

    // Step 2: Play GSAP loading animation
    playLoadingAnimation();

    // Step 3: Initialize event listeners
    initEventListeners();

    // Note: loadUserData() and loadSongs() are called from checkSession()
    // after session validation, which happens before animation completes
});

function logout() {
    deleteCookie("keybeats_session");
    window.location.href = "login.html";
}