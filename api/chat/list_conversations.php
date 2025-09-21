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

try {
    // Check if user is admin (admin is always id=3)
    if ($_SESSION['user_id'] != 3) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }

    $sql = "
    SELECT c.id as conversation_id, u.id as user_id, u.email, CONCAT(u.firstname, ' ', u.lastname) as name,
           c.status, c.created_at, c.updated_at,
           (
             SELECT content FROM messages m2 WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1
           ) as last_message,
           (
             SELECT created_at FROM messages m2 WHERE m2.conversation_id = c.id ORDER BY m2.created_at DESC LIMIT 1
           ) as last_message_time,
           (
             SELECT COUNT(*) FROM messages m3 WHERE m3.conversation_id = c.id AND m3.is_read = 0 AND m3.sender_id = u.id
           ) as unread_count
    FROM conversations c
    JOIN users u ON c.user_id = u.id
    ORDER BY last_message_time DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['conversations' => $conversations]);
    
} catch (PDOException $e) {
    error_log("Database error in list_conversations: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?> 