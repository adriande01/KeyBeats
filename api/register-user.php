<?php
// keybeats/api/register-user.php
ob_start();
ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');

$nickname = $_POST['nickname'] ?? '';
$email    = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$avatar   = $_POST['avatar'] ?? '';

if (!$nickname || !$email || !$password || !$avatar) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Missing required fields"], JSON_UNESCAPED_UNICODE);
    exit;
}

$usersFile = __DIR__ . "/../data/users.json";
$users = [];
if (file_exists($usersFile)) {
    $raw = @file_get_contents($usersFile);
    $users = @json_decode($raw, true) ?: [];
}

foreach ($users as $user) {
    if (strtolower($user['nickname']) === strtolower($nickname)) {
        ob_clean();
        echo json_encode(["success" => false, "message" => "Nickname already taken"], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (strtolower($user['email']) === strtolower($email)) {
        ob_clean();
        echo json_encode(["success" => false, "message" => "Email already registered"], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// GENERAR ID EN SERVIDOR
$userId = "user_" . time() . "_" . bin2hex(random_bytes(4));

$newUser = [
    "id" => $userId,
    "nickname" => $nickname,
    "email" => $email,
    "password" => password_hash($password, PASSWORD_DEFAULT),
    "avatar" => $avatar,
    "level" => 0,
    "completedSongs" => 0,
    "createdAt" => date('c'),
    "progress" => []
];

$users[] = $newUser;

if (@file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Failed to save user"], JSON_UNESCAPED_UNICODE);
    exit;
}

ob_clean();
echo json_encode(["success" => true, "message" => "User registered successfully", "userId" => $userId], JSON_UNESCAPED_UNICODE);
exit;