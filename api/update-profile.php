<?php
header('Content-Type: application/json');
require_once '../config.php'; // Your existing config file

// Debugging setup
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verify request method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['success' => false, 'message' => 'Only POST requests allowed']));
}

// Get and validate input
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE || !$input) {
    http_response_code(400);
    die(json_encode(['success' => false, 'message' => 'Invalid JSON data']));
}

// Check authentication
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    die(json_encode(['success' => false, 'message' => 'Not authenticated']));
}

try {
    // Prepare update query
    $updates = [];
    $params = ['id' => $_SESSION['user_id']];
    
    $fields = ['firstname', 'lastname', 'email', 'phone', 'address'];
    foreach ($fields as $field) {
        if (isset($input[$field])) {
            $updates[] = "$field = :$field";
            $params[$field] = $input[$field];
        }
    }

    if (empty($updates)) {
        http_response_code(400);
        die(json_encode(['success' => false, 'message' => 'No fields to update']));
    }

    $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $pdo->prepare($sql);
    
    if (!$stmt->execute($params)) {
        throw new PDOException('Execute failed');
    }

    // Verify update
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found after update');
    }

    // Update session
    $_SESSION = array_merge($_SESSION, $user);

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'data' => $user
    ]);

} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
} catch (Exception $e) {
    error_log("Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}