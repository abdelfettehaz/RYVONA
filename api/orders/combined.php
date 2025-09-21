<?php
require_once '../config.php';
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['email'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$userStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$userStmt->execute([$_SESSION['email']]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not found']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$designIds = $data['designIds'] ?? [];
$totalPrice = $data['totalPrice'] ?? 0;

if (!is_array($designIds) || count($designIds) < 2) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'At least 2 designs required']);
    exit;
}

try {
    $stmt = $pdo->prepare("INSERT INTO combined_orders (user_id, design_ids, total_price) VALUES (?, ?, ?)");
    $stmt->execute([$user['id'], json_encode($designIds), $totalPrice]);
    echo json_encode(['success' => true, 'orderId' => $pdo->lastInsertId()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create combined order', 'error' => $e->getMessage()]);
} 