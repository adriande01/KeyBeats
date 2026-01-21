<?php
ob_start();
ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

$userId = $_POST['userId'] ?? '';
if (!$userId) {
    ob_clean();
    echo json_encode(["success" => false], JSON_UNESCAPED_UNICODE);
    exit;
}

$usersFile = __DIR__ . "/../data/users.json";
$users = json_decode(file_get_contents($usersFile), true);

foreach ($users as $user) {
    if ($user['id'] === $userId) {
        unset($user['password']);
        ob_clean();
        echo json_encode(["success" => true, "user" => $user], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

ob_clean();
echo json_encode(["success" => false], JSON_UNESCAPED_UNICODE);
exit;