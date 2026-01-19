<?php
// keybeats/api/register-user.php

header('Content-Type: application/json');

// Get data from AJAX request
$nickname = $_POST['nickname'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$avatar = $_POST['avatar'] ?? '';

if (!$nickname || !$email || !$password || !$avatar) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required fields"
    ]);
    exit;
}

$usersFile = __DIR__ . "/../data/users.json";

// Load existing users or create empty array
if (file_exists($usersFile)) {
    $users = json_decode(file_get_contents($usersFile), true);
} else {
    $users = [];
}

// Check again to avoid duplicates
foreach ($users as $user) {
    if (strtolower($user['nickname']) === strtolower($nickname)) {
        echo json_encode([
            "success" => false,
            "message" => "Nickname already exists"
        ]);
        exit;
    }

    if (strtolower($user['email']) === strtolower($email)) {
        echo json_encode([
            "success" => false,
            "message" => "Email already exists"
        ]);
        exit;
    }
}

// Create new user (simple version)
$newUser = [
    "id" => "user_" . time() . "_" . rand(1000, 9999),
    "nickname" => $nickname,
    "email" => $email,
    "password" => password_hash($password, PASSWORD_DEFAULT),
    "avatar" => $avatar,
    "level" => 0,
    "completedSongs" => 0,
    "songProgress" => new stdClass(),
    "createdAt" => date("c")
];

// Add to array
$users[] = $newUser;

// Save back to JSON
file_put_contents($usersFile, json_encode($users, JSON_PRETTY_PRINT));

echo json_encode([
    "success" => true,
    "message" => "User registered successfully",
    "userId" => $newUser["id"]
]);
