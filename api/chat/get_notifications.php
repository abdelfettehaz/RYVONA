<?php
require_once __DIR__ . '/../../config.php';
session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;

try {
    // Check if user is admin
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $is_admin = $user['role'] === 'admin';

    // Get notifications based on user role
    if ($is_admin) {
        // Admin sees all notifications from all users
        $stmt = $pdo->prepare("
            SELECT n.*, 
                   c.id as conversation_id,
                   u.firstname, u.lastname, u.role
            FROM notifications n
            LEFT JOIN conversations c ON n.related_id = c.id
            LEFT JOIN users u ON c.user_id = u.id
            WHERE n.type = 'message'
            ORDER BY n.created_at DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $limit, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        // Regular user sees only notifications from admin
        $stmt = $pdo->prepare("
            SELECT n.*, 
                   c.id as conversation_id,
                   u.firstname, u.lastname, u.role
            FROM notifications n
            LEFT JOIN conversations c ON n.related_id = c.id
            LEFT JOIN users u ON c.admin_id = u.id
            WHERE n.user_id = ? AND n.type = 'message'
            ORDER BY n.created_at DESC
            LIMIT ?
        ");
        $stmt->bindValue(1, $user_id, PDO::PARAM_INT);
        $stmt->bindValue(2, $limit, PDO::PARAM_INT);
        $stmt->execute();
    }
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Count unread notifications based on user role
    if ($is_admin) {
        $stmt = $pdo->prepare("SELECT COUNT(*) as unread_count FROM notifications WHERE type = 'message'");
        $stmt->execute();
    } else {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as unread_count 
            FROM notifications n
            WHERE n.user_id = ? AND n.type = 'message'
        ");
        $stmt->bindValue(1, $user_id, PDO::PARAM_INT);
        $stmt->execute();
    }
    $unread = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'notifications' => $notifications,
        'unread_count' => $unread['unread_count']
    ]);

} catch (PDOException $e) {
    error_log("Database error in get_notifications: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred', 'details' => $e->getMessage()]);
}
?>