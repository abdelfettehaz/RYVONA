<?php
header('Content-Type: application/json');
require_once '../config.php';

session_start();
if (!isset($_SESSION['email'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['id']) || !isset($input['side'])) {
        throw new Exception('Design ID and side are required');
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$_SESSION['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('User not found');
    }

    $side_column = $input['side'] . '_design';
    $valid_columns = ['front_design', 'back_design', 'left_design', 'right_design'];
    
    if (!in_array($side_column, $valid_columns)) {
        throw new Exception('Invalid side specified');
    }

    // Update the specific side to NULL
    $stmt = $pdo->prepare("
        UPDATE orders 
        SET $side_column = NULL 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$input['id'], $user['id']]);
    
    if ($stmt->rowCount() === 0) {
        throw new Exception('Design not found or side already removed');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Design side removed successfully'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error removing design side: ' . $e->getMessage()
    ]);
}
?>