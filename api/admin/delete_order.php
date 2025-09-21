<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['order_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID is required']);
        exit();
    }

    $order_id = $input['order_id'];
    
    // Delete order from orders_admin table
    $stmt = $pdo->prepare("DELETE FROM orders_admin WHERE id = ?");
    $stmt->execute([$order_id]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Order deleted successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
    }
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred']);
}
?> 