<?php
require_once __DIR__ . '/../../config.php';
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get current user and target user
$current_user_id = $_SESSION['user_id'] ?? null;
$target_user_id = $_GET['user_id'] ?? null;

if (!$current_user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
    exit;
}

try {
    // Admin initiating conversation (user_id=3 is admin)
    if ($current_user_id == 3 && $target_user_id) {
        // Verify target user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'user'");
        $stmt->execute([$target_user_id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit;
        }

        // Find existing open conversation
        $stmt = $pdo->prepare("SELECT * FROM conversations WHERE user_id = ? AND status = 'open' LIMIT 1");
        $stmt->execute([$target_user_id]);
        $conversation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($conversation) {
            echo json_encode(['conversation' => $conversation]);
            exit;
        }
        
        // Create new conversation
        $stmt = $pdo->prepare("INSERT INTO conversations (user_id, admin_id, status) VALUES (?, ?, 'open')");
        $stmt->execute([$target_user_id, $current_user_id]);
        $new_id = $pdo->lastInsertId();
        
        $stmt = $pdo->prepare("SELECT * FROM conversations WHERE id = ?");
        $stmt->execute([$new_id]);
        $conversation = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(['conversation' => $conversation]);
        exit;
    }

    // Regular user flow (original code)
    $stmt = $pdo->prepare("SELECT * FROM conversations WHERE user_id = ? AND status = 'open' LIMIT 1");
    $stmt->execute([$current_user_id]);
    $conversation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($conversation) {
        echo json_encode(['conversation' => $conversation]);
        exit;
    }
    
    // Create new conversation
    $stmt = $pdo->prepare("INSERT INTO conversations (user_id, status) VALUES (?, 'open')");
    $stmt->execute([$current_user_id]);
    $new_id = $pdo->lastInsertId();
    
    $stmt = $pdo->prepare("SELECT * FROM conversations WHERE id = ?");
    $stmt->execute([$new_id]);
    $conversation = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode(['conversation' => $conversation]);
    
} catch (PDOException $e) {
    error_log("Database error in get_or_create_conversation: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred', 'details' => $e->getMessage()]);
}
?>