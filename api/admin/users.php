<?php
header('Content-Type: application/json');
require_once '../../config.php';

try {
    $stmt = $pdo->prepare("SELECT id, email, firstname, lastname, role FROM users WHERE role = 'user'");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $users]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}