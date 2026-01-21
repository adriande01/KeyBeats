<?php
// keybeats/api/save-progress.php
ob_start();
ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');

$userId = $_POST['userId'] ?? '';
$songId = $_POST['songId'] ?? '';
$starsEarned = isset($_POST['starsEarned']) ? (int)$_POST['starsEarned'] : 0;

if (!$userId || !$songId) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Missing userId or songId"], JSON_UNESCAPED_UNICODE);
    exit;
}

$usersFile = __DIR__ . "/../data/users.json";
if (!file_exists($usersFile)) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Users file not found"], JSON_UNESCAPED_UNICODE);
    exit;
}

$users = json_decode(file_get_contents($usersFile), true);

// FIND USER
$userIndex = null;
foreach ($users as $index => $user) {
    if ($user['id'] === $userId) {
        $userIndex = $index;
        break;
    }
}

if ($userIndex === null) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "User not found"], JSON_UNESCAPED_UNICODE);
    exit;
}

// FIND EXISTING PROGRESS FOR THIS SONG
$progressIndex = null;
foreach ($users[$userIndex]['progress'] as $index => $prog) {
    if ($prog['songId'] === $songId) {
        $progressIndex = $index;
        break;
    }
}

// IF 0 STARS, DELETE PROGRESS
if ($starsEarned === 0) {
    if ($progressIndex !== null) {
        array_splice($users[$userIndex]['progress'], $progressIndex, 1);
    }
} else {
    // UPDATE OR CREATE PROGRESS
    if ($progressIndex !== null) {
        // ONLY UPDATE IF NEW STARS > OLD STARS
        if ($starsEarned > $users[$userIndex]['progress'][$progressIndex]['starsEarned']) {
            $users[$userIndex]['progress'][$progressIndex]['starsEarned'] = $starsEarned;
            $users[$userIndex]['progress'][$progressIndex]['lastPlayed'] = date('c');
            $users[$userIndex]['progress'][$progressIndex]['attempts']++;
        } else {
            // JUST INCREMENT ATTEMPTS
            $users[$userIndex]['progress'][$progressIndex]['attempts']++;
            $users[$userIndex]['progress'][$progressIndex]['lastPlayed'] = date('c');
        }
    } else {
        // CREATE NEW PROGRESS
        $progressId = "progress_" . time() . "_" . bin2hex(random_bytes(4));
        $users[$userIndex]['progress'][] = [
            "id" => $progressId,
            "userId" => $userId,
            "songId" => $songId,
            "starsEarned" => $starsEarned,
            "lastPlayed" => date('c'),
            "attempts" => 1
        ];
    }
}

// RECALCULATE LEVEL AND COMPLETED SONGS
$totalStars = 0;
$completedCount = 0;
foreach ($users[$userIndex]['progress'] as $prog) {
    $totalStars += $prog['starsEarned'];
    if ($prog['starsEarned'] >= 1) {
        $completedCount++;
    }
}

$users[$userIndex]['level'] = $totalStars;
$users[$userIndex]['completedSongs'] = $completedCount;

// SAVE
if (@file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Failed to save progress"], JSON_UNESCAPED_UNICODE);
    exit;
}

ob_clean();
echo json_encode(["success" => true, "level" => $totalStars, "completedSongs" => $completedCount], JSON_UNESCAPED_UNICODE);
exit;