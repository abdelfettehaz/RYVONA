<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

try {
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        throw new Exception('Not authenticated', 401);
    }
    $user_id = $_SESSION['user']['id'];

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $imageData = $input['image'] ?? '';
    $product = $input['product'] ?? '';
    $color = $input['color'] ?? '';
    $view = $input['view'] ?? 'front';
    $size = $input['size'] ?? 'M';

    if (empty($imageData) || empty($product) || empty($color) || empty($size)) {
        throw new Exception('Missing required data', 400);
    }

    // Remove data URL prefix if present
    if (strpos($imageData, 'base64,') !== false) {
        $imageData = explode('base64,', $imageData)[1];
    }
    $imageData = base64_decode($imageData);

    // Use a path relative to the project root
    $relativeDir = '/saved_designs/';
    $projectRoot = realpath(__DIR__ . '/../');
    $uploadDir = $projectRoot . $relativeDir;

    // Ensure directory exists and is writable
    if (!file_exists($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            error_log("Failed to create directory: $uploadDir");
            throw new Exception('Failed to create directory for saving designs', 500);
        }
    }
    if (!is_writable($uploadDir)) {
        error_log("Directory not writable: $uploadDir");
        throw new Exception('Directory not writable for saving designs', 500);
    }

    // Generate unique filename
    $filename = uniqid('design_') . '_' . time() . '.png';
    $filePath = $uploadDir . $filename;
    if (!file_put_contents($filePath, $imageData)) {
        error_log("Failed to save image file: $filePath");
        throw new Exception('Failed to save image file', 500);
    }

    // Insert into saved_designs table
    $stmt = $pdo->prepare("INSERT INTO saved_designs (user_id, filename, product_type, color, size, view_angle, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$user_id, $filename, $product, $color, $size, $view]);
    $designId = $pdo->lastInsertId();

    echo json_encode([
        'success' => true,
        'design' => [
            'id' => $designId,
            'type' => 'custom',
            'design_path' => 'saved_designs/' . $filename,
            'front_design' => $view === 'front' ? 'saved_designs/' . $filename : null,
            'back_design' => $view === 'back' ? 'saved_designs/' . $filename : null,
            'left_design' => $view === 'left' ? 'saved_designs/' . $filename : null,
            'right_design' => $view === 'right' ? 'saved_designs/' . $filename : null,
            'product_type' => $product,
            'color' => $color,
            'size' => $size,
            'view_angle' => $view,
            'created_at' => date('Y-m-d H:i:s'),
            'status' => 'pending',
            'total_price' => 0.00
        ]
    ]);
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>