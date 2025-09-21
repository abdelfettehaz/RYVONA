<?php
header('Content-Type: application/json');
require_once '../config.php';
session_start();

try {
    if (!isset($_SESSION['email'])) throw new Exception('Not authenticated', 401);

    $userStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $userStmt->execute([$_SESSION['email']]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) throw new Exception('User not found', 401);

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('Method not allowed', 405);

    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'] ?? null;
    if (!$id) throw new Exception('No ID provided', 400);

    // Try to delete from orders (Orders & Combined Designs)
    $stmt = $pdo->prepare("DELETE FROM orders WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user['id']]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => true, 'deleted_id' => $id, 'type' => 'order']);
        exit;
    }

    // Try to delete from saved_designs (Custom Designs)
    $stmt = $pdo->prepare("SELECT filename FROM saved_designs WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $user['id']]);
    $design = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($design) {
        $projectRoot = realpath(__DIR__ . '/../');
        $file_path = $projectRoot . '/saved_designs/' . $design['filename'];
        if (file_exists($file_path)) {
            unlink($file_path);
        }
        $delStmt = $pdo->prepare("DELETE FROM saved_designs WHERE id = ? AND user_id = ?");
        $delStmt->execute([$id, $user['id']]);
        echo json_encode(['success' => true, 'deleted_id' => $id, 'type' => 'custom']);
        exit;
    }

    throw new Exception('Design not found or already deleted');
} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>