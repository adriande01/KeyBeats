<?php
// keybeats/api/check-email.php

header('Content-Type: application/json');

$email = $_POST['email'] ?? '';

if (empty($email)) {
    echo json_encode([
        "success" => false,
        "message" => "No email provided"
    ]);
    exit;
}

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
    if (strtolower($user['email']) === strtolower($email)) {
        $exists = true;
        break;
    }
}

echo json_encode([
    "success" => true,
    "exists" => $exists
]);
