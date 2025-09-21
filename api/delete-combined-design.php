<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

try {
    if (!isset($_SESSION['email'])) throw new Exception('Not authenticated', 401);

    $userStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $userStmt->execute([$_SESSION['email']]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) throw new Exception('User not found', 401);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('Method not allowed', 405);

    $input = json_decode(file_get_contents('php://input'), true);
    $ids = $input['ids'] ?? [];
    if (!is_array($ids) || empty($ids)) throw new Exception('No IDs provided', 400);

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $params = array_merge($ids, [$user['id']]);
    $stmt = $pdo->prepare("DELETE FROM combined_orders WHERE id IN ($placeholders) AND user_id = ?");
    $stmt->execute($params);

    echo json_encode(['success' => true, 'deleted_ids' => $ids]);
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} 