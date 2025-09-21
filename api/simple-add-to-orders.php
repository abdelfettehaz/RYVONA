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

// Get the design data from POST
$input = json_decode(file_get_contents('php://input'), true);

// Enhanced validation - accept both design_* and template_* field names
$design_id = $input['design_id'] ?? $input['template_id'] ?? null;
$design_image = $input['design_image'] ?? $input['template_image'] ?? null;

if (!$design_id || !$design_image) {
    echo json_encode(['success' => false, 'message' => 'Missing design information']);
    exit();
}

// Get template data including size
$template_data = $input['template_data'] ?? $input['design_data'] ?? [];
$template_price = $template_data['price'] ?? null;

// Initialize variables
$size = null;
$color = null;
$product_type = null;

// First check if size is provided in the template data (this takes precedence)
$size = $template_data['size'] ?? null;

// If size wasn't in template data, try to get it from saved_designs
if (!$size && $design_id) {
    try {
        $stmt = $pdo->prepare("SELECT size, color, product_type FROM saved_designs WHERE id = ?");
        $stmt->execute([$design_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Only use these values if they weren't set from template data
        $size = $size ?? $result['size'] ?? null;
        $color = $color ?? $result['color'] ?? null;
        $product_type = $product_type ?? $result['product_type'] ?? null;
    } catch (Exception $e) {
        error_log("Error fetching design details: " . $e->getMessage());
    }
}

// Set defaults if still not set
$size = $size ?? 'M'; // Default to Medium if not specified
$color = $color ?? $template_data['color'] ?? null;
$product_type = $product_type ?? $template_data['product_type'] ?? 't-shirt'; // Default to t-shirt if not specified

// Use the template price directly as the total price
$total_price = $template_price ? floatval($template_price) : 15.98;
$base_price = 0.00;
$design_price = $total_price;

try {
    // Insert into orders table with size from template data
    $stmt = $pdo->prepare("
        INSERT INTO orders (
            user_id,
            status,
            quantity,
            front_design,
            base_price,
            design_price,
            total_price,
            product_type,
            color,
            size,
            is_cart_order,
            design_card_html,
            design_data
        ) VALUES (?, 'under review', 1, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    ");
    
    $designCardHtml = $input['design_card_html'] ?? $input['template_card_html'] ?? '';
    $designData = json_encode($template_data);
    
    $stmt->execute([
        $user_id, 
        $design_image, 
        $base_price, 
        $design_price, 
        $total_price, 
        $product_type,
        $color,
        $size, 
        $designCardHtml, 
        $designData
    ]);
    
    $order_id = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Design added to My Orders with status: Under Review!',
        'order_id' => $order_id,
        'total_price' => $total_price,
        'template_price' => $template_price,
        'size' => $size,
        'size_source' => isset($template_data['size']) ? 'template' : 'saved_design'
    ]);
    
} catch (Exception $e) {
    error_log("Error adding to orders: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error adding to orders: ' . $e->getMessage()
    ]);
}
?>