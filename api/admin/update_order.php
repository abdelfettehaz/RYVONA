<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['order_id']) || !isset($input['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Order ID and status are required']);
        exit();
    }

    $order_id = $input['order_id'];
    $status = $input['status'];
    
    // Validate status
    $valid_statuses = ['under review', 'confirmed', 'rejected'];
    if (!in_array($status, $valid_statuses)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status. Must be: under review, confirmed, or rejected']);
        exit();
    }
    
    // Update order status in orders_admin table
    if ($status === 'confirmed') {
        // Set status and created_at to NOW() for confirmed orders
        $stmt = $pdo->prepare("UPDATE orders_admin SET status = ?, created_at = NOW() WHERE id = ?");
        $stmt->execute([$status, $order_id]);
        // Also update the original order
        $stmt = $pdo->prepare("UPDATE orders SET status = ?, created_at = NOW() WHERE id = (SELECT order_id FROM orders_admin WHERE id = ?)");
        $stmt->execute([$status, $order_id]);
        // Save confirmation to file with full order details
        $now = date('Y-m-d H:i:s');
        $orderDetails = $pdo->prepare("SELECT id, client_name, client_email, design_price, created_at FROM orders_admin WHERE id = ?");
        $orderDetails->execute([$order_id]);
        $orderRow = $orderDetails->fetch(PDO::FETCH_ASSOC);
        if ($orderRow) {
            $confirmedDate = substr($orderRow['created_at'], 0, 10);
            $logLine = sprintf(
                "OrderID: %s, Name: %s, Email: %s, DesignPrice: %s, ConfirmedAt: %s\n",
                $orderRow['id'],
                $orderRow['client_name'],
                $orderRow['client_email'],
                $orderRow['design_price'],
                $confirmedDate
            );
            file_put_contents(__DIR__ . '/confirmed_orders.txt', $logLine, FILE_APPEND);
        }
    } else {
        // Only update status for other cases
        $stmt = $pdo->prepare("UPDATE orders_admin SET status = ? WHERE id = ?");
        $stmt->execute([$status, $order_id]);
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = (SELECT order_id FROM orders_admin WHERE id = ?)");
        $stmt->execute([$status, $order_id]);
        // If status is rejected, remove from confirmed_orders.txt
        if ($status === 'rejected') {
            $file = __DIR__ . '/confirmed_orders.txt';
            if (file_exists($file)) {
                $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                $filtered = array_filter($lines, function($line) use ($order_id) {
                    // Match OrderID: <id>,
                    return !preg_match('/OrderID: ?' . preg_quote($order_id, '/') . '\b/', $line);
                });
                file_put_contents($file, implode("\n", $filtered) . (count($filtered) ? "\n" : ""));
            }
        }
    }
    
    if ($stmt->rowCount() > 0) {
        // Also update the original order status
        $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = (SELECT order_id FROM orders_admin WHERE id = ?)");
        $stmt->execute([$status, $order_id]);
        
        echo json_encode(['success' => true, 'message' => 'Order status updated successfully']);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
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