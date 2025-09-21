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
$notification_ids = $_POST['notification_ids'] ?? [];

try {
    if (!empty($notification_ids)) {
        // Delete specific notifications
        $placeholders = implode(',', array_fill(0, count($notification_ids), '?'));
        $stmt = $pdo->prepare("
            DELETE FROM notifications 
            WHERE id IN ($placeholders) AND user_id = ?
        ");
        $params = array_merge($notification_ids, [$user_id]);
        $stmt->execute($params);
    } else {
        // Delete all notifications for the user
        $stmt = $pdo->prepare("DELETE FROM notifications WHERE user_id = ?");
        $stmt->execute([$user_id]);
    }
    
    echo json_encode(['success' => true]);
    
} catch (PDOException $e) {
    error_log("Database error in mark_notifications_read: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?>