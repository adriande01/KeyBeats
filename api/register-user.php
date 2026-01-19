<?php
// keybeats/api/register-user.php
// Safe JSON response

ob_start();
ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');

// Read POST data
$nickname = $_POST['nickname'] ?? '';
$email    = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$avatar   = $_POST['avatar'] ?? '';

// Validate required fields
if (!$nickname || !$email || !$password || !$avatar) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Load users
$usersFile = __DIR__ . "/../data/users.json";
$users = [];
if (file_exists($usersFile)) {
    $raw = @file_get_contents($usersFile);
    $users = @json_decode($raw, true) ?: [];
}

// Check duplicates
foreach ($users as $user) {
    if (strtolower($user['nickname']) === strtolower($nickname)) {
        ob_clean();
        echo json_encode([
            "success" => false,
            "message" => "Nickname already taken"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (strtolower($user['email']) === strtolower($email)) {
        ob_clean();
        echo json_encode([
            "success" => false,
            "message" => "Email already registered"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Add new user
$newUser = [
    "nickname" => $nickname,
    "email"    => $email,
    "password" => $hashedPassword,
    "avatar"   => $avatar,
    "progress" => []  // optional: store song progress
];

$users[] = $newUser;

// Save users JSON
if (@file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Failed to save user"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Return success
ob_clean();
echo json_encode([
    "success" => true,
    "message" => "User registered successfully"
], JSON_UNESCAPED_UNICODE);
exit;
