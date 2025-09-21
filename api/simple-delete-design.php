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

// Get the design data from POST
$input = json_decode(file_get_contents('php://input'), true);

// Validation
if (!isset($input['design_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing design ID']);
    exit();
}

try {
    // Get user ID from session
    if (!isset($_SESSION['user']) || !isset($_SESSION['user']['id'])) {
        echo json_encode(['success' => false, 'message' => 'Not authenticated']);
        exit();
    }
    
    $user_id = $_SESSION['user']['id'];
    
    // Get the design details first to find the corresponding file
    $stmt = $pdo->prepare("
        SELECT filename FROM saved_designs 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$input['design_id'], $user_id]);
    $design = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$design) {
        // Debug: Check if design exists for any user
        $debugStmt = $pdo->prepare("SELECT id, user_id FROM saved_designs WHERE id = ?");
        $debugStmt->execute([$input['design_id']]);
        $debugDesign = $debugStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($debugDesign) {
            echo json_encode([
                'success' => false,
                'message' => 'Design not found for this user (design belongs to user_id: ' . $debugDesign['user_id'] . ', current user_id: ' . $user_id . ')'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Design not found in database'
            ]);
        }
        exit();
    }
    
    // Delete the design from saved_designs table
    $stmt = $pdo->prepare("
        DELETE FROM saved_designs 
        WHERE id = ? AND user_id = ?
    ");
    
    $result = $stmt->execute([$input['design_id'], $user_id]);
    
    if ($result && $stmt->rowCount() > 0) {
        // Delete the actual file if it exists
        $projectRoot = realpath(__DIR__ . '/../');
        $file_path = $projectRoot . '/saved_designs/' . $design['filename'];
        if (file_exists($file_path)) {
            unlink($file_path);
        }
        
        // Also delete any orders that reference this design
        // First, try to find orders by design_data containing the design ID
        $orderStmt = $pdo->prepare("
            DELETE FROM orders 
            WHERE user_id = ? 
            AND (
                design_data LIKE ? 
                OR design_data LIKE ?
                OR design_data LIKE ?
            )
        ");
        
        // Search for orders that contain this design ID in their design_data
        $designSearchPattern1 = '%"id":' . $input['design_id'] . '%';
        $designSearchPattern2 = '%"design_id":' . $input['design_id'] . '%';
        $designSearchPattern3 = '%"id": ' . $input['design_id'] . '%';
        
        $orderStmt->execute([$user_id, $designSearchPattern1, $designSearchPattern2, $designSearchPattern3]);
        $deletedOrders = $orderStmt->rowCount();
        
        // Also try to delete orders that have the same filename in front_design
        if ($deletedOrders === 0) {
            $filenameOrderStmt = $pdo->prepare("
                DELETE FROM orders 
                WHERE user_id = ? 
                AND front_design LIKE ?
            ");
            
            $filenamePattern = '%' . $design['filename'] . '%';
            $filenameOrderStmt->execute([$user_id, $filenamePattern]);
            $deletedOrders = $filenameOrderStmt->rowCount();
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Design deleted successfully!' . ($deletedOrders > 0 ? " Also deleted $deletedOrders related order(s)." : ''),
            'deleted_orders' => $deletedOrders
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Design not found or could not be deleted'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?> 