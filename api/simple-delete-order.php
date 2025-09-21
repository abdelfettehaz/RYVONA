<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

session_start();
if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in (session missing)']);
    exit();
}
$user = $_SESSION['user'];
$user_id = $user['id'];

// Get the order data from POST
$input = json_decode(file_get_contents('php://input'), true);

// Validation
if (!isset($input['order_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing order ID']);
    exit();
}

try {
    // Check if the order exists and belongs to the user
    $checkStmt = $pdo->prepare("SELECT id, user_id FROM orders WHERE id = ?");
    $checkStmt->execute([$input['order_id']]);
    $order = $checkStmt->fetch(PDO::FETCH_ASSOC);
    if (!$order) {
        echo json_encode(['success' => false, 'message' => 'Order not found']);
        exit();
    }
    if ($order['user_id'] != $user_id) {
        echo json_encode(['success' => false, 'message' => 'Order does not belong to the current user']);
        exit();
    }
    // Delete the order from the orders table only (don't affect saved_designs)
    $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ? AND user_id = ?");
    $result = $stmt->execute([$input['order_id'], $user_id]);
    if ($result && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Order deleted successfully!'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Order could not be deleted (database error)'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 