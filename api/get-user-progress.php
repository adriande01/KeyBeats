<?php
// keybeats/api/get-user-progress.php
// Returns the user's progress array and basic profile info (level, completedSongs).
// Accepts POST: userId
// Responds: { success: true, user: {...}, progress: [...] }

ob_start();
ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

$userId = $_POST['userId'] ?? '';

if (!$userId) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Missing userId"], JSON_UNESCAPED_UNICODE);
    exit;
}

$usersFile = __DIR__ . "/../data/users.json";
if (!file_exists($usersFile)) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Users file not found"], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = @file_get_contents($usersFile);
$users = @json_decode($raw, true);
if ($users === null) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Failed to parse users"], JSON_UNESCAPED_UNICODE);
    exit;
}

$found = null;
foreach ($users as $u) {
    if (isset($u['id']) && $u['id'] === $userId) {
        $found = $u;
        break;
    }
}

if ($found === null) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "User not found"], JSON_UNESCAPED_UNICODE);
    exit;
}

// Ensure progress array exists
if (!isset($found['progress']) || !is_array($found['progress'])) {
    $found['progress'] = [];
}

$response = [
    "success" => true,
    "user" => [
        "id" => $found['id'],
        "nickname" => $found['nickname'] ?? '',
        "avatar" => $found['avatar'] ?? '',
        "level" => $found['level'] ?? 0,
        "completedSongs" => $found['completedSongs'] ?? 0,
        "progress" => $found['progress']
    ]
];

ob_clean();
echo json_encode($response, JSON_UNESCAPED_UNICODE);
exit;
