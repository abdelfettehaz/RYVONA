<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Debug: Log that the script is being called
error_log("Create order script called - Method: " . $_SERVER['REQUEST_METHOD']);

require_once '../config.php';

// Get authorization token
$headers = getallheaders();
$token = null;

if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
} elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No authorization token provided']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Debug: Log the token
    error_log("Create order - Token received: " . substr($token, 0, 10) . "...");
    
    // Verify token and get user
    $stmt = $pdo->prepare("SELECT u.id, u.email, u.firstname FROM users u JOIN user_tokens t ON u.id = t.user_id WHERE t.token = ? AND t.expires_at > NOW()");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Debug: Log user info
    error_log("Create order - User found: " . ($user ? "Yes - ID: " . $user['id'] : "No"));
    
    // Debug: Check if token exists in database
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM user_tokens WHERE token = ?");
    $stmt->execute([$token]);
    $tokenCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    error_log("Create order - Token exists in database: " . ($tokenCount > 0 ? "Yes" : "No"));
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Invalid or expired token']);
        exit();
    }

    // Get POST data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Debug: Log received data
    error_log("Create order - Received data: " . json_encode($input));
    
    // Validate required fields
    $required_fields = ['design_data', 'product_type', 'color', 'view_angle', 'quantity', 'base_price', 'design_price', 'total_price'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field])) {
            error_log("Create order - Missing field: $field");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
            exit();
        }
    }

    // Parse design data
    $design_data = json_decode($input['design_data'], true);
    
    // Insert order into database - using exact table structure
    $stmt = $pdo->prepare("
        INSERT INTO orders (
            user_id,
            status,
            created_at,
            quantity,
            design_data,
            final_price,
            left_design,
            right_design,
            source_designs,
            front_design,
            back_design,
            base_price,
            design_price,
            total_price,
            updated_at,
            product_type,
            color,
            view_angle,
            is_hidden,
            is_cart_order,
            approval_timestamp
        ) VALUES (?, 'under review', NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, 0, 1, NULL)
    ");
    
    $params = [
        $user['id'],
        $input['quantity'],
        $input['design_data'],
        $input['final_price'] ?? null,
        $design_data['left_design'] ?? null,
        $design_data['right_design'] ?? null,
        $input['source_designs'] ?? null,
        $design_data['front_design'] ?? null,
        $design_data['back_design'] ?? null,
        $input['base_price'],
        $input['design_price'],
        $input['total_price'],
        $input['product_type'],
        $input['color'],
        $input['view_angle']
    ];
    
    // Debug: Log parameters
    error_log("Create order - Parameters: " . json_encode($params));
    
    $stmt->execute($params);
    
    $order_id = $pdo->lastInsertId();
    error_log("Create order - Order created with ID: " . $order_id);
    
    // Return success response with order details
    echo json_encode([
        'success' => true, 
        'message' => 'Order created successfully',
        'data' => [
            'order_id' => $order_id,
            'user_id' => $user['id'],
            'status' => 'under review',
            'total_price' => $input['total_price']
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in create-order.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("General error in create-order.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An error occurred while creating the order']);
}
?> 