<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

// Get authorization token
$headers = getallheaders();
$token = null;
$user_id = null;

// Try to get token from Authorization header
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
} elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

// If no token, try session
if (!$token) {
    session_start();
    if (isset($_SESSION['user']) && isset($_SESSION['user']['id'])) {
        $user_id = $_SESSION['user']['id'];
    }
}

// If we have a token, verify it and get user ID
if ($token) {
    $stmt = $pdo->prepare("SELECT u.id FROM users u JOIN user_tokens t ON u.id = t.user_id WHERE t.token = ? AND t.expires_at > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        $user_id = $user['id'];
    }
}

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User not authenticated']);
    exit();
}

try {
    // Get user ID (for now, use user ID 3 as default)
    // REMOVE: $user_id = $user['id'];
    
    // Enhanced query to get all orders and combined designs including design card HTML
    $stmt = $pdo->prepare("
        SELECT 
            id,
            user_id,
            status,
            created_at,
            quantity,
            front_design,
            back_design,
            left_design,
            right_design,
            base_price,
            design_price,
            total_price,
            product_type,
            color,
            is_cart_order,
            design_card_html,
            design_data,
            source_designs,
            CASE 
                WHEN source_designs IS NOT NULL THEN 'combined'
                ELSE 'order'
            END as order_type
        FROM orders 
        WHERE user_id = ?
        AND is_cart_order = 0
        ORDER BY created_at DESC
    ");
    
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Debug: Log the results
    error_log("Orders API: Found " . count($orders) . " orders");
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'count' => count($orders),
        'debug' => [
            'total_orders' => count($orders),
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    error_log("Orders API Error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'debug' => [
            'error' => $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}
?> 