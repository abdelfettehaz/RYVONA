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
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Check if user is admin (admin is always id=3)
if ($_SESSION['user_id'] != 3) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$status = $_POST['status'] ?? 'offline';
if ($status !== 'online' && $status !== 'offline') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid status']);
    exit;
}

file_put_contents(__DIR__ . '/admin_status.txt', $status);
echo json_encode(['success' => true, 'status' => $status]);
?> 