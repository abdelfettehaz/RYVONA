<?php
require_once __DIR__ . '/../../config.php';
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$status = 'offline';
if (file_exists(__DIR__ . '/admin_status.txt')) {
    $status = trim(file_get_contents(__DIR__ . '/admin_status.txt'));
}

echo json_encode(['status' => $status]);
?> 