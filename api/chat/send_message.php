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
$content = trim($_POST['content'] ?? '');
$image_url = $_POST['image_url'] ?? null;

if (!$conversation_id || (!$content && !$image_url)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing conversation_id or content/image']);
    exit;
}

try {
    // Check user is part of conversation (admin is always id=3)
    $stmt = $pdo->prepare("SELECT * FROM conversations WHERE id = ?");
    $stmt->execute([$conversation_id]);
    $conv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$conv || ($conv['user_id'] != $user_id && $user_id != 3)) {
        http_response_code(403);
        echo json_encode(['error' => 'Not part of conversation']);
        exit;
    }
    
    // Insert message with optional image_url
    $stmt = $pdo->prepare("INSERT INTO messages (conversation_id, sender_id, content, image_url, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())");
    $stmt->execute([$conversation_id, $user_id, $content, $image_url]);
    $message_id = $pdo->lastInsertId();
    
    // Update conversation updated_at
    $stmt = $pdo->prepare("UPDATE conversations SET updated_at = NOW() WHERE id = ?");
    $stmt->execute([$conversation_id]);
    
    // Create notification for the recipient
    $recipient_id = ($user_id == 3) ? $conv['user_id'] : 3; // If admin sent, notify user; if user sent, notify admin
    
    // Get sender name for notification message
    $stmt = $pdo->prepare("SELECT firstname, lastname, role FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $sender = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $sender_name = ($sender['role'] == 'admin') ? 'RYVONA' : $sender['firstname'] . ' ' . $sender['lastname'];
    $notification_message = $sender_name . ' sent you a message';
    
    $stmt = $pdo->prepare("INSERT INTO notifications (user_id, message, related_id, type) VALUES (?, ?, ?, 'message')");
    $stmt->execute([$recipient_id, $notification_message, $conversation_id]);
    
    // Log notification creation for debugging
    error_log("Notification created: user_id=$recipient_id, message='$notification_message', conversation_id=$conversation_id");
    
    // Return new message
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE id = ?");
    $stmt->execute([$message_id]);
    $message = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['message' => $message]);
    
} catch (PDOException $e) {
    error_log("Database error in send_message: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?>