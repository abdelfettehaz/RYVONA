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

$headers = getallheaders();
$token = null;
$user = null;

if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
} elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

if (!$token && isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("SELECT id, email, firstname, lastname FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
}

if (!$token && !$user) {
    http_response_code(401);
    echo json_encode(['error' => 'No authorization token or session provided']);
    exit();
}

try {
    if ($token) {
        $stmt = $pdo->prepare("SELECT u.* FROM users u JOIN user_tokens t ON u.id = t.user_id WHERE t.token = ? AND t.expires_at > NOW()");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit();
        }
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['order_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID is required']);
        exit();
    }

    $order_id = $input['order_id'];
    $quantity = isset($input['quantity']) ? intval($input['quantity']) : 1;
    
    // Get the original order
    $stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?");
    $stmt->execute([$order_id, $user['id']]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit();
    }
    
    // Get size from the original order
    $size = $order['size'] ?? '';
    
    // Calculate total price correctly
    $original_quantity = isset($order['quantity']) && $order['quantity'] > 0 ? $order['quantity'] : 1;
    $unit_price = isset($order['total_price']) ? ($order['total_price'] / $original_quantity) : 0;
    $total_price = $unit_price * $quantity;


    // Check if order is already submitted to admin
    $stmt = $pdo->prepare("SELECT id FROM orders_admin WHERE order_id = ?");
    $stmt->execute([$order_id]);
    if ($stmt->rowCount() > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Order already submitted for admin review']);
        exit();
    }
    
    // Get complete user details for client information
    $stmt = $pdo->prepare("SELECT firstname, lastname, email, phone, country, city, address, postal, cin FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $userDetails = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$userDetails) {
        http_response_code(404);
        echo json_encode(['error' => 'User details not found']);
        exit();
    }

    $clientName = $userDetails['firstname'] . ' ' . $userDetails['lastname'];
    $clientEmail = $userDetails['email'];
    $phone = $userDetails['phone'];
    $country = $userDetails['country'];
    $city = $userDetails['city'];
    $address = $userDetails['address'];
    $postal = $userDetails['postal'];
    $cin = $userDetails['cin'];
    
    // Handle currency conversion for Tunisian users
    $currency = 'EUR'; // Default currency
    if (strtolower($country) === 'tunisia') {
        $total_price = $total_price * 3.3; // Convert EUR to TND
        $currency = 'TND';
    }
    
    // Use the currency from the request if provided
    if (isset($input['currency'])) {
        $currency = $input['currency'];
    }
    // Insert into orders_admin table with all required fields
    $stmt = $pdo->prepare("
        INSERT INTO orders_admin (
            user_id, order_id, client_name, client_email, status, quantity, size, 
            phone, country, city, address, postal, cin,
            front_design, back_design, left_design, right_design, 
            design_data, source_designs, base_price, design_price, 
            total_price, product_type, color, view_angle, 
            is_hidden, is_cart_order, currency
        ) VALUES (
            :user_id, :order_id, :client_name, :client_email, 'under review', :quantity, :size,
            :phone, :country, :city, :address, :postal, :cin,
            :front_design, :back_design, :left_design, :right_design,
            :design_data, :source_designs, :base_price, :design_price,
            :total_price, :product_type, :color, :view_angle,
            :is_hidden, :is_cart_order, :currency
        )
    ");
    
    $stmt->execute([
        ':user_id' => $user['id'],
        ':order_id' => $order_id,
        ':client_name' => $clientName,
        ':client_email' => $clientEmail,
        ':quantity' => $quantity,
        ':size' => $size,
        ':phone' => $phone,
        ':country' => $country,
        ':city' => $city,
        ':address' => $address,
        ':postal' => $postal,
        ':cin' => $cin,
        ':front_design' => $order['front_design'],
        ':back_design' => $order['back_design'],
        ':left_design' => $order['left_design'],
        ':right_design' => $order['right_design'],
        ':design_data' => $order['design_data'],
        ':source_designs' => $order['source_designs'],
        ':base_price' => $order['base_price'],
        ':design_price' => $order['design_price'],
        ':total_price' => $total_price,
        ':product_type' => $order['product_type'],
        ':color' => $order['color'],
        ':view_angle' => $order['view_angle'],
        ':is_hidden' => $order['is_hidden'] ?? false,
        ':is_cart_order' => $order['is_cart_order'] ?? false,
        ':currency' => $currency
    ]);
    
    $admin_order_id = $pdo->lastInsertId();
    
    // Update original order status
    $stmt = $pdo->prepare("UPDATE orders SET status = 'submitted_for_review' WHERE id = ?");
    $stmt->execute([$order_id]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Order submitted for admin review successfully',
        'admin_order_id' => $admin_order_id
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>