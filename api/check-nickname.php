<?php
// keybeats/api/check-nickname.php
// Safe JSON response: discard any previous output and disable display of warnings.

ob_start();                       // Start output buffer (capture any accidental output)
ini_set('display_errors', '0');   // Turn off display of PHP errors (they'll go to logs)
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');

// Read the nickname from the request (works for form-encoded POST)
$nickname = $_POST['nickname'] ?? '';

if (empty($nickname)) {
    // Clear buffer (remove any HTML/warnings) and send JSON
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "No nickname provided"
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Load users from JSON file (relative to this script)
$usersFile = __DIR__ . "/../data/users.json";

if (!file_exists($usersFile)) {
    ob_clean();
    echo json_encode([
        "success" => true,
        "exists" => false
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Try to read and decode safely
$raw = @file_get_contents($usersFile);
$users = @json_decode($raw, true);
if (!is_array($users)) {
    // If JSON broken, respond safe
    ob_clean();
    echo json_encode([
        "success" => true,
        "exists" => false
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$exists = false;
foreach ($users as $user) {
    if (isset($user['nickname']) && strtolower($user['nickname']) === strtolower($nickname)) {
        $exists = true;
        break;
    }
}

// Clean any buffered output (warnings, BOM, etc.) and return JSON only
ob_clean();
echo json_encode([
    "success" => true,
    "exists" => $exists
], JSON_UNESCAPED_UNICODE);
exit;
