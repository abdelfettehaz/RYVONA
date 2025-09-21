<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Authentication required.']);
    exit;
}

$uploadDir = __DIR__ . '/../uploaded_templates/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $statusFilter = isset($_GET['status']) ? "WHERE status = '" . $_GET['status'] . "'" : "";
        $stmt = $pdo->query("SELECT id, name, description, image_url, status FROM tshirt_templates $statusFilter ORDER BY created_at DESC");
        $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $templates]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Check if user is admin for POST operations (upload/update)
    if ($_SESSION['user_role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
        exit;
    }
    
    // Handle status update (JSON body)
    if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
        if (isset($input['id'], $input['status'])) {
            try {
                $stmt = $pdo->prepare('UPDATE tshirt_templates SET status = ? WHERE id = ?');
                $stmt->execute([$input['status'], $input['id']]);
                echo json_encode(['success' => true, 'message' => 'Status updated']);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
    }
    // Handle image upload (multipart/form-data)
    try {
        // Debug logging
        error_log("POST request received");
        error_log("FILES: " . print_r($_FILES, true));
        error_log("POST: " . print_r($_POST, true));
        error_log("Session user_id: " . ($_SESSION['user_id'] ?? 'not set'));
        error_log("Session user_role: " . ($_SESSION['user_role'] ?? 'not set'));
        
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Image upload failed: ' . ($_FILES['image']['error'] ?? 'no file'));
        }
        $image = $_FILES['image'];
        $ext = pathinfo($image['name'], PATHINFO_EXTENSION);
        $filename = uniqid('tpl_') . '.' . $ext;
        $targetPath = $uploadDir . $filename;
        if (!move_uploaded_file($image['tmp_name'], $targetPath)) {
            throw new Exception('Failed to save image');
        }
        $imageUrl = '/uploaded_templates/' . $filename;
        $name = $_POST['name'] ?? '';
        $description = $_POST['description'] ?? '';
        $status = $_POST['status'] ?? 'in_stock';
        $user_id = $_SESSION['user_id'];
        $stmt = $pdo->prepare('INSERT INTO tshirt_templates (user_id, name, description, image_url, status) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$user_id, $name, $description, $imageUrl, $status]);
        echo json_encode(['success' => true, 'message' => 'Template uploaded successfully']);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Check if user is admin for DELETE operations
    if ($_SESSION['user_role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Access denied. Admin privileges required.']);
        exit;
    }
    
    // Handle template deletion (JSON body)
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['id'])) {
        try {
            // Get template info to delete the image file
            $stmt = $pdo->prepare('SELECT image_url FROM tshirt_templates WHERE id = ?');
            $stmt->execute([$input['id']]);
            $template = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($template) {
                // Delete the image file
                $imagePath = __DIR__ . '/..' . $template['image_url'];
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
                
                // Delete from database
                $stmt = $pdo->prepare('DELETE FROM tshirt_templates WHERE id = ?');
                $stmt->execute([$input['id']]);
                
                echo json_encode(['success' => true, 'message' => 'Template deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Template not found']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error deleting template: ' . $e->getMessage()]);
        }
        exit;
    }
    
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Template ID required']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed']); 