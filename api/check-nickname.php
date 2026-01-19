<?php
// keybeats/api/check-nickname.php

header('Content-Type: application/json');

// Read the nickname from the request
$nickname = $_POST['nickname'] ?? '';

if (empty($nickname)) {
    echo json_encode([
        "success" => false,
        "message" => "No nickname provided"
    ]);
    exit;
}

// Load users from JSON file
$usersFile = __DIR__ . "/../data/users.json";

if (!file_exists($usersFile)) {
    echo json_encode([
        "success" => true,
        "exists" => false
    ]);
    exit;
}

$users = json_decode(file_get_contents($usersFile), true);

$exists = false;

foreach ($users as $user) {
    if (strtolower($user['nickname']) === strtolower($nickname)) {
        $exists = true;
        break;
    }
}

echo json_encode([
    "success" => true,
    "exists" => $exists
]);
