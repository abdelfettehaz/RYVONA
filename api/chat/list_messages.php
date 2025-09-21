<?php
require_once __DIR__ . '/../../config.php';
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$conversation_id = $_GET['conversation_id'] ?? $_POST['conversation_id'] ?? null;
if (!$conversation_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing conversation_id']);
    exit;
}
// Check user is part of conversation (admin is always id=3)
$sql = "SELECT * FROM conversations WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $conversation_id);
$stmt->execute();
$result = $stmt->get_result();
$conv = $result->fetch_assoc();
if (!$conv || ($conv['user_id'] != $user_id && $user_id != 3)) {
    http_response_code(403);
    echo json_encode(['error' => 'Not part of conversation']);
    exit;
}
// List messages
$sql = "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $conversation_id);
$stmt->execute();
$result = $stmt->get_result();
$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}
echo json_encode(['messages' => $messages]); 