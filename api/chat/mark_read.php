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

$user_id = $_SESSION['user_id'];
$conversation_id = $_POST['conversation_id'] ?? null;

if (!$conversation_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing conversation_id']);
    exit;
}

try {
    // Mark all messages sent by the other party as read
    $stmt = $pdo->prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?");
    $stmt->execute([$conversation_id, $user_id]);
    
    // Delete related notifications
    $stmt = $pdo->prepare("
        DELETE FROM notifications
        WHERE user_id = ? AND related_id = ? AND type = 'message'
    ");
    $stmt->execute([$user_id, $conversation_id]);
    
    echo json_encode(['success' => true]);
    
} catch (PDOException $e) {
    error_log("Database error in mark_read: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?>