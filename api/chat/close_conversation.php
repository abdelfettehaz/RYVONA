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
    // Check user is part of conversation (admin is always id=3)
    $stmt = $pdo->prepare("SELECT * FROM conversations WHERE id = ?");
    $stmt->execute([$conversation_id]);
    $conv = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$conv || ($conv['user_id'] != $user_id && $user_id != 3)) {
        http_response_code(403);
        echo json_encode(['error' => 'Not part of conversation']);
        exit;
    }
    
    // Close conversation
    $stmt = $pdo->prepare("UPDATE conversations SET status = 'closed', updated_at = NOW() WHERE id = ?");
    $stmt->execute([$conversation_id]);
    
    echo json_encode(['success' => true]);
    
} catch (PDOException $e) {
    error_log("Database error in close_conversation: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?> 