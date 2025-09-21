<?php
header('Content-Type: application/json');
require_once '../config.php';

session_start();
if (!isset($_SESSION['email'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, firstname, lastname, email FROM users WHERE email = ?");
    $stmt->execute([$_SESSION['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('User not found');
    }

    // Get orders with size
    $stmt = $pdo->prepare("
        SELECT 
            'order' as type,
            id,
            front_design,
            back_design,
            left_design,
            right_design,
            product_type as product,
            color,
            size,
            view_angle as view,
            created_at,
            status,
            CASE
                WHEN front_design IS NOT NULL AND front_design != '' THEN front_design
                WHEN back_design IS NOT NULL AND back_design != '' THEN back_design
                WHEN left_design IS NOT NULL AND left_design != '' THEN left_design
                WHEN right_design IS NOT NULL AND right_design != '' THEN right_design
                ELSE NULL
            END as design_path
        FROM orders 
        WHERE user_id = ?
        AND deleted_at IS NULL
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user['id']]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get saved designs with size
    $stmt = $pdo->prepare("
        SELECT 
            'custom' as type,
            id,
            CONCAT('saved_designs/', filename) as design_path,
            product_type as product,
            color,
            size,
            view_angle as view,
            created_at
        FROM saved_designs 
        WHERE user_id = ?
        AND deleted_at IS NULL
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user['id']]);
    $saved_designs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Filter out designs where the file doesn't exist
    $base_path = dirname(__DIR__) . '/saved_designs/';
    $filtered_designs = array_filter($saved_designs, function($design) use ($base_path, $pdo) {
        if (!isset($design['design_path'])) return false;
        $file_path = $base_path . basename($design['design_path']);
        if (file_exists($file_path)) {
            return true;
        } else {
            error_log("Auto-removing design ID: " . $design['id'] . " because file missing: $file_path");
            $delStmt = $pdo->prepare("DELETE FROM saved_designs WHERE id = ?");
            $delStmt->execute([$design['id']]);
            file_put_contents(__DIR__ . '/../saved_designs/save_log.txt', date('c') . " DELETED: $file_path\n", FILE_APPEND);
            return false;
        }
    });

    echo json_encode([
        'success' => true,
        'data' => array_merge($orders, array_values($filtered_designs))
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching designs: ' . $e->getMessage()
    ]);
}
?>