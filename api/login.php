<?php
// keybeats/api/login.php
// Safe JSON response: validate user credentials

ob_start();                      // Capture any accidental output
ini_set('display_errors', '0');  // Turn off PHP warnings/notices
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');

// Read email and password from POST
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';


// Validate input
if (empty($email) || empty($password)) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Load users JSON
$usersFile = __DIR__ . "/../data/users.json";

if (!file_exists($usersFile)) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Users database not found"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = @file_get_contents($usersFile);
$users = @json_decode($raw, true);
if (!is_array($users)) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Error reading users database"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Find user by email (case-insensitive)
$foundUser = null;
foreach ($users as $user) {
    if (isset($user['email']) && strtolower($user['email']) === strtolower($email)) {
        $foundUser = $user;
        break;
    }
}

// Check if user exists
if ($foundUser === null) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Email not registered"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Verify password
if (!password_verify($password, $foundUser['password'])) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Incorrect password"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Login successful - return user data without password
$userData = [
    "id" => $foundUser['id'],
    "nickname" => $foundUser['nickname'],
    "email" => $foundUser['email'],
    "avatar" => $foundUser['avatar'],
    "level" => $foundUser['level'],
    "completedSongs" => $foundUser['completedSongs'],
    "createdAt" => $foundUser['createdAt']
];

ob_clean();
echo json_encode([
    "success" => true,
    "message" => "Login successful",
    "user" => $userData
], JSON_UNESCAPED_UNICODE);
exit;