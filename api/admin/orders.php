<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // First check if the table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'orders_admin'");
    if ($stmt->rowCount() == 0) {
        // Table doesn't exist, return empty array
        echo json_encode(['success' => true, 'orders' => []]);
        exit();
    }
    
    $stmt = $pdo->prepare("
        SELECT oa.id, oa.user_id, oa.order_id, oa.client_name, oa.client_email,oa.phone,oa.country,oa.city,oa.address,oa.postal,oa.cin,
               oa.front_design, oa.back_design, oa.left_design, oa.right_design,
               oa.base_price, oa.design_price, oa.total_price, oa.quantity, 
               oa.size, oa.status, oa.created_at, oa.product_type, oa.color
        FROM orders_admin oa
        ORDER BY oa.created_at DESC
    ");
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'orders' => $orders]);
    
} catch (PDOException $e) {
    error_log("Database error in admin/orders.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error occurred',
        'details' => $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("General error in admin/orders.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred',
        'details' => $e->getMessage()
    ]);
}
?>