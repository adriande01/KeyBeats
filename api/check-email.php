<?php
// keybeats/api/check-email.php
// Safe JSON response

ob_start();                      // Capture any accidental output
ini_set('display_errors', '0');  // Turn off PHP warnings/notices
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');

// Read email from POST
$email = $_POST['email'] ?? '';

if (empty($email)) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "No email provided"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Load users JSON
$usersFile = __DIR__ . "/../data/users.json";

if (!file_exists($usersFile)) {
    ob_clean();
    echo json_encode([
        "success" => true,
        "exists" => false
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = @file_get_contents($usersFile);
$users = @json_decode($raw, true);
if (!is_array($users)) {
    ob_clean();
    echo json_encode([
        "success" => true,
        "exists" => false
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$exists = false;
foreach ($users as $user) {
    if (isset($user['email']) && strtolower($user['email']) === strtolower($email)) {
        $exists = true;
        break;
    }
}

// Return clean JSON
ob_clean();
echo json_encode([
    "success" => true,
    "exists" => $exists
], JSON_UNESCAPED_UNICODE);
exit;
