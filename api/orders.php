<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

// Start session
session_start();

// Get authorization token or session user
$headers = getallheaders();
$token = null;
$user = null;

// Try to get token from Authorization header
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
} elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

// If no token, try to get user from session
if (!$token && isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("SELECT id, email, firstname FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
}

// If still no user, return error
if (!$token && !$user) {
    http_response_code(401);
    echo json_encode(['error' => 'No authorization token or session provided']);
    exit();
}

try {
    // If we have a token, verify it and get user
    if ($token) {
        $stmt = $pdo->prepare("SELECT u.id, u.email, u.firstname FROM users u JOIN user_tokens t ON u.id = t.user_id WHERE t.token = ? AND t.expires_at > NOW()");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit();
        }
    }
    // If no token but we have session user, use that
    elseif (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'No valid authentication found']);
        exit();
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch user's orders with all design information
        $stmt = $pdo->prepare("
            SELECT 
                id, 
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
            FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$user['id']]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'orders' => $orders]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['delete_order'])) {
            // Delete order
            $order_id = $input['order_id'];
            
            $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ? AND user_id = ?");
            $stmt->execute([$order_id, $user['id']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Order deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Order not found or cannot be deleted']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid request']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
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