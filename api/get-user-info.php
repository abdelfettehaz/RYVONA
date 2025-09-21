<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

// Start session
session_start();

// Get authorization token or session user
$headers = getallheaders();
$token = null;
$user = null;

// Try to get token from Authorization header
if (isset($headers['Authorization'])) {
    $token = str_replace('Bearer ', '', $headers['Authorization']);
} elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION']);
}

// If no token, try to get user from session
if (!$token && isset($_SESSION['user_id'])) {
    $stmt = $pdo->prepare("SELECT id, email, firstname, role, country FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
}

// If still no user, return error
if (!$token && !$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No authorization token or session provided']);
    exit();
}

try {
    // If we have a token, verify it and get user
    if ($token) {
        $stmt = $pdo->prepare("SELECT u.id, u.email, u.firstname, u.role, u.country FROM users u JOIN user_tokens t ON u.id = t.user_id WHERE t.token = ? AND t.expires_at > NOW()");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid or expired token']);
            exit();
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'user' => [
                'role' => $user['role'] ?? 'user',
                'country' => $user['country'] ?? ''
            ]
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An error occurred']);
}
?>