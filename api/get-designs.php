<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();
if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}
$user_id = $_SESSION['user']['id'];

try {
    // Get custom designs from saved_designs only (no combined designs)
    $stmt = $pdo->prepare("
        SELECT 
            'custom' as type,
            id,
            CONCAT('saved_designs/', filename) as design_path,
            CONCAT('saved_designs/', filename) as front_design,
            NULL as back_design,
            NULL as left_design,
            NULL as right_design,
            product_type,
            color,
            view_angle,
            created_at,
            'pending' as status,
            0.00 as total_price,
            NULL as source_designs
        FROM saved_designs 
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user_id]);
    $saved_designs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Filter out designs where the file doesn't exist
    $projectRoot = realpath(__DIR__ . '/../');
    $base_path = $projectRoot . '/saved_designs/';
    $filtered_designs = array_filter($saved_designs, function($design) use ($base_path, $pdo) {
        if (!isset($design['design_path'])) return false;
        $file_path = $base_path . basename($design['design_path']);
        if (file_exists($file_path)) {
            return true;
        } else {
            // Auto-remove from DB if file missing
            error_log("Auto-removing design ID: " . $design['id'] . " because file missing: $file_path");
            $delStmt = $pdo->prepare("DELETE FROM saved_designs WHERE id = ?");
            $delStmt->execute([$design['id']]);
            return false;
        }
    });

    // Only use custom designs (no combined designs)
    $allDesigns = array_values($filtered_designs);
    // Format the data for frontend
    $formattedDesigns = array_map(function($design) {
        return [
            'id' => $design['id'],
            'type' => $design['type'],
            'front_design' => $design['front_design'],
            'back_design' => $design['back_design'],
            'left_design' => $design['left_design'],
            'right_design' => $design['right_design'],
            'design_path' => $design['design_path'] ?? $design['front_design'],
            'product_type' => $design['product_type'],
            'color' => $design['color'],
            'view_angle' => $design['view_angle'],
            'created_at' => $design['created_at'],
            'status' => $design['status'],
            'total_price' => floatval($design['total_price']),
            'source_designs' => $design['source_designs'] ? json_decode($design['source_designs'], true) : null
        ];
    }, $allDesigns);

    echo json_encode([
        'success' => true,
        'data' => $formattedDesigns
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching designs: ' . $e->getMessage()
    ]);
}
?> 