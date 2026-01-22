/**
 * game.js — KeyBeats gameplay (AJAX + JSON)
 *
 * Requirements:
 *  - api/get-songs.php     (provided)
 *  - api/get-user-progress.php  (we provided above)
 *  - api/save-progress.php  (you already had)
 *  - cookie "keybeats_session" must include either the userId string or a JSON object containing userId
 *
 * Behavior:
 *  - load song by ?songId=...
 *  - load user progress from server (for read-only prior record display)
 *  - run gameplay (runStars starts at 0)
 *  - accept keyboard input (single keys and modifier combos like "Ctrl+D")
 *  - at song end, POST to api/save-progress.php with userId, songId, starsEarned
 */

(function () {
  // ---------- Utility: get cookie ----------
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  // ---------- Utility: parse session cookie to extract userId ----------
  function getSessionUserId() {
    const raw = getCookie('keybeats_session');
    if (!raw) return null;
    try {
      // cookie might be a JSON stringified object or plain userId string
      const decoded = decodeURIComponent(raw);
      const parsed = JSON.parse(decoded);
      // If JSON with userId field, return it
      if (parsed && parsed.userId) return parsed.userId;
      // If JSON-like is actually an object with id
      if (parsed && parsed.id) return parsed.id;
      // Otherwise if parsed is string fallback
      if (typeof parsed === 'string') return parsed;
    } catch (e) {
      // Not JSON, return raw value
      return raw;
    }
    return null;
  }

  // ---------- Utility: read querystring ----------
  function qs(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // ---------- Key normalization / combo matching ----------
  // Expected format for beat.keys: "A", "S", "Ctrl+D", "Shift+X", "Ctrl+Shift+F"
  function comboMatchesEvent(expectedCombo, event) {
    if (!expectedCombo) return false;
    const parts = expectedCombo.split('+').map(p => p.trim().toUpperCase());
    // check modifiers
    const needCtrl = parts.includes('CTRL') || parts.includes('CONTROL');
    const needShift = parts.includes('SHIFT');
    const needAlt = parts.includes('ALT');

    // The last non-modifier token is the main key (e.g. 'D' in 'CTRL+D')
    const mainParts = parts.filter(p => !['CTRL', 'CONTROL', 'SHIFT', 'ALT'].includes(p));
    const mainKey = mainParts.length ? mainParts[mainParts.length - 1] : null;

    if (needCtrl && !event.ctrlKey) return false;
    if (needShift && !event.shiftKey) return false;
    if (needAlt && !event.altKey) return false;

    if (!mainKey) {
      // only modifiers expected (rare) - accept if modifiers match
      return true;
    }

    const pressed = event.key ? String(event.key).toUpperCase() : '';
    // Normalize special names: ArrowLeft -> LEFT, etc.
    const normalizedPressed = pressed.replace('ARROW', '').toUpperCase();

    // If mainKey is a single character, match against event.key
    if (mainKey.length === 1) {
      return normalizedPressed === mainKey;
    }

    // For named keys like ENTER, SPACE, ESC
    return normalizedPressed === mainKey;
  }

  // ---------- Global runtime state ----------
  let currentSong = null;
  let beats = [];
  let beatIndex = 0;
  let beatActive = false;
  let runStars = 0;
  let maxStars = 0;
  let userId = null;
  let audio = null;
  let gameEnded = false;

  // UI references
  const $timer = $('#timerDisplay');
  const $beatBox = $('#beatBox');
  const $beatKeys = $('#beatKeys');
  const $starsEarned = $('#starsEarned');
  const $modal = $('#gameOverModal');
  const $modalStars = $('#modalStars');
  const $modalName = $('#modalSongName');
  const $modalAuthor = $('#modalSongAuthor');
  const $modalStarsEarned = $('#modalStarsEarned');
  const $modalMaxStars = $('#modalMaxStars');

  // ---------- Load song and user then start ----------
  $(document).ready(() => {
    userId = getSessionUserId();
    if (!userId) {
      // no session -> redirect to login
      window.location.href = 'login.html';
      return;
    }

    const songId = qs('songId');
    if (!songId) {
      // no song selected -> go back
      window.location.href = 'index.html';
      return;
    }

    // load songs then initialize
    $.ajax({
      url: 'api/get-songs.php',
      method: 'GET',
      dataType: 'json'
    }).done(function (res) {
      if (!res || !res.success || !Array.isArray(res.songs)) {
        alert('Failed to load songs');
        return;
      }

      const songs = res.songs;
      const s = songs.find(x => x.id === songId);
      if (!s) {
        alert('Song not found');
        window.location.href = 'index.html';
        return;
      }

      currentSong = s;
      beats = Array.isArray(s.beats) ? s.beats.slice().sort((a,b) => (a.order||0)-(b.order||0)) : [];
      maxStars = s.maxStars || 0;

      // UI initial
      $('#songName').text(currentSong.name || '');
      $modalName.text(currentSong.name || '');
      $modalAuthor.text(currentSong.author || '');
      $modalMaxStars.text(maxStars);

      // set audio
      audio = document.getElementById('audioPlayer');
      if (!audio) {
        console.error('audio element not found');
        return;
      }
      audio.src = currentSong.audioFile || '';
      audio.load();

      // load user's previous progress for display (optional)
      loadUserProgress(userId, function () {
        // start playing after we know user
        startRun();
      });

    }).fail(function () {
      alert('Error loading songs from server');
    });
  });

  // ---------- loadUserProgress (read-only display of record prior to play) ----------
  function loadUserProgress(userId, cb) {
    $.ajax({
      url: 'api/get-user-progress.php',
      method: 'POST',
      dataType: 'json',
      data: { userId: userId }
    }).done(function (res) {
      if (res && res.success && res.user) {
        // we can show record / attempts if needed
        const progressArr = res.user.progress || [];
        const prog = progressArr.find(p => p.songId === currentSong.id);
        const recordStars = prog ? (prog.starsEarned || 0) : 0;
        // show record in header (if you have a spot) - optional
        // render record stars (we keep run stars separate)
        // but here we simply render 0-run stars initially:
        renderRunStars(0);
      }
      if (cb) cb();
    }).fail(function () {
      if (cb) cb();
    });
  }

  // ---------- Start run ----------
  function startRun() {
    runStars = 0;
    beatIndex = 0;
    beatActive = false;
    gameEnded = false;

    // Prepare audio event listeners
    audio.ontimeupdate = onTimeUpdate;
    audio.onended = onSongEnd;

    // keyboard handler
    $(document).off('keydown.game').on('keydown.game', function (e) {
      if (!beatActive || gameEnded) return;
      handleKeyForCurrentBeat(e);
    });

    $(document).one('keydown', () => {
        audio.play();
    });

    renderRunStars(runStars);
  }

  // ---------- audio time update ----------
  function onTimeUpdate() {
    const t = audio.currentTime;
    updateTimerDisplay(t);

    // check next beat if any
    if (beatIndex >= beats.length) return;

    const nextBeat = beats[beatIndex];
    // Show beat when we reach its timestamp (or small allowance earlier)
    if (!beatActive && t >= (nextBeat.timestamp - 0.05)) {
      showBeat(nextBeat);
    }
  }

  function updateTimerDisplay(current) {
    const mm = String(Math.floor(current / 60)).padStart(2, '0');
    const ss = String(Math.floor(current % 60)).padStart(2, '0');
    $timer.text(`${mm}:${ss}`);
  }

  // ---------- show beat ----------
  function showBeat(beat) {
    beatActive = true;
    $beatKeys.text(beat.keys || '');
    $beatBox.stop(true, true).fadeIn(80);

    // small window to respond (0.7s). If not pressed, it's a miss.
    const windowMs = 700;
    setTimeout(() => {
      if (beatActive) {
        // user didn't press in time -> fail
        applyFail();
        advanceBeatState();
      }
    }, windowMs);
  }

  // ---------- handle keyboard input for current beat ----------
  function handleKeyForCurrentBeat(e) {
    if (beatIndex >= beats.length) return;

    const beat = beats[beatIndex];
    const ok = comboMatchesEvent(beat.keys, e);
    if (ok) {
      applySuccess();
    } else {
      applyFail();
    }
    advanceBeatState();
  }

  // ---------- apply success/fail ----------
  function applySuccess() {
    runStars = Math.min(runStars + 1, maxStars);
    renderRunStars(runStars);
    // small visual feedback (could add animation)
    $beatBox.addClass('success');
    setTimeout(() => $beatBox.removeClass('success'), 180);
  }

  function applyFail() {
    runStars = Math.max(0, runStars - 1);
    renderRunStars(runStars);
    $beatBox.addClass('fail');
    setTimeout(() => $beatBox.removeClass('fail'), 180);
  }

  // ---------- advance beat state ----------
  function advanceBeatState() {
    beatActive = false;
    $beatBox.stop(true, true).fadeOut(80);
    beatIndex++;
  }

  // ---------- render run stars (in top-left area) ----------
  function renderRunStars(stars) {
    $starsEarned.empty();
    for (let i = 0; i < maxStars; i++) {
      if (i < stars) {
        $starsEarned.append('<i class="fas fa-star star-filled"></i>');
      } else {
        $starsEarned.append('<i class="far fa-star star-empty"></i>');
      }
    }
  }

  // ---------- song ended ----------
  function onSongEnd() {
    if (gameEnded) return;
    gameEnded = true;

    // At song end: we must call save-progress API
    // According to your business rule: prior record must not decrease – save-progress.php already enforces this.
    const postData = {
      userId: userId,
      songId: currentSong.id,
      starsEarned: runStars
    };

    // show loading or disable UI
    $.ajax({
      url: 'api/save-progress.php',
      method: 'POST',
      dataType: 'json',
      data: postData
    }).done(function (res) {
      // res: { success: true, level: ..., completedSongs: ... } on success
      // Show game-over modal with final info.
      const finalStars = runStars;
      $modalStars.empty();
      for (let i = 0; i < maxStars; i++) {
        if (i < finalStars) {
          $modalStars.append('<i class="fas fa-star star-filled"></i>');
        } else {
          $modalStars.append('<i class="far fa-star star-empty"></i>');
        }
      }
      $modalStarsEarned.text(finalStars);
      $modalMaxStars.text(maxStars);

      // show modal
      $modal.fadeIn(240);
    }).fail(function () {
      // even if save fails, show modal so user sees result (but notify)
      const finalStars = runStars;
      $modalStars.empty();
      for (let i = 0; i < maxStars; i++) {
        if (i < finalStars) {
          $modalStars.append('<i class="fas fa-star star-filled"></i>');
        } else {
          $modalStars.append('<i class="far fa-star star-empty"></i>');
        }
      }
      $modalStarsEarned.text(finalStars);
      $modalMaxStars.text(maxStars);

      $modal.fadeIn(240);
      console.warn('save-progress request failed.');
    });
  }

  // ---------- modal main menu button ----------
  $('#btnMainMenu').on('click', function (e) {
    e.preventDefault();
    window.location.href = 'index.html';
  });

})();
