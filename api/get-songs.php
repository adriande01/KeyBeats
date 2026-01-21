<?php
ob_start();
ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

$songsFile = __DIR__ . "/../data/songs.json";

if (!file_exists($songsFile)) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Songs file not found"], JSON_UNESCAPED_UNICODE);
    exit;
}

$songs = json_decode(file_get_contents($songsFile), true);

if ($songs === null) {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Failed to parse songs"], JSON_UNESCAPED_UNICODE);
    exit;
}

ob_clean();
echo json_encode(["success" => true, "songs" => $songs], JSON_UNESCAPED_UNICODE);
exit;