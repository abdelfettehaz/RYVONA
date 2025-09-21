<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Authentication check
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('Not authenticated', 401);
    }
    $user_id = $_SESSION['user']['id'];

    // Method check
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }

    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON input', 400);
    }

    $designIds = $input['designIds'] ?? [];
    if (!is_array($designIds) || count($designIds) < 2) {
        throw new Exception('At least 2 designs required', 400);
    }

    // Accept mapping: { front: id, back: id, left: id, right: id }
    $sides = ['front', 'back', 'left', 'right'];
    $selected = array_intersect_key($designIds, array_flip($sides));
    if (count($selected) < 1) {
        throw new Exception('No valid sides selected', 400);
    }

    // Fetch images for each selected side
    $sideImages = [];
    $sourceDesigns = [];
    foreach ($selected as $side => $id) {
        $stmt = $pdo->prepare("SELECT filename FROM saved_designs WHERE id = ? AND user_id = ?");
        $stmt->execute([$id, $user_id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new Exception("Design not found for side $side", 400);
        }
        $imgPath = 'saved_designs/' . $row['filename'];
        $sideImages[$side] = $imgPath;
        $sourceDesigns[$side] = [
            'designId' => $id,
            'image' => $imgPath
        ];
    }

    // Calculate price
    $basePrice = 5.99;
    $sidesCount = count($sideImages);
    $designPrice = match($sidesCount) {
        2 => 19.99,
        3 => 29.99,
        4 => 39.99,
        default => 9.99 * $sidesCount
    };
    $totalPrice = $basePrice + $designPrice;

    // Insert new combined design into orders table (fill all required fields)
    $stmt = $pdo->prepare("
        INSERT INTO orders (
            user_id, front_design, back_design, left_design, right_design,
            base_price, design_price, total_price, status, source_designs,
            quantity, created_at, is_hidden, is_cart_order,
            product_type, color, view_angle, design_data, final_price, updated_at, approval_timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'under review', ?, 1, NOW(), 0, 0, ?, ?, ?, ?, NULL, NULL, NULL)
    ");
    $stmt->execute([
        $user_id,
        $sideImages['front'] ?? null,
        $sideImages['back'] ?? null,
        $sideImages['left'] ?? null,
        $sideImages['right'] ?? null,
        $basePrice,
        $designPrice,
        $totalPrice,
        json_encode($sourceDesigns),
        'Combined', // product_type
        null, // color
        null, // view_angle
        null // design_data
    ]);
    $orderId = $pdo->lastInsertId();

    // Return the new combined design
    echo json_encode([
        'success' => true,
        'design' => [
            'id' => $orderId,
            'type' => 'order',
            'front_design' => $sideImages['front'] ?? null,
            'back_design' => $sideImages['back'] ?? null,
            'left_design' => $sideImages['left'] ?? null,
            'right_design' => $sideImages['right'] ?? null,
            'base_price' => $basePrice,
            'design_price' => $designPrice,
            'total_price' => $totalPrice,
            'status' => 'under review',
            'source_designs' => $sourceDesigns,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_details' => [
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTrace()
        ]
    ]);
    error_log("Combine designs error: " . $e->getMessage());
}
?>