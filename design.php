<?php
session_start();
require_once 'config.php';
require_once './project/backend/chat-widget-handler.php';

// Include chat widget but don't output it yet
include_chat_widget();

// Ensure orders table has all necessary columns, including is_hidden and is_cart_order
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        front_design VARCHAR(255) NULL,
        back_design VARCHAR(255) NULL,
        left_design VARCHAR(255) NULL,
        right_design VARCHAR(255) NULL,
        product_type VARCHAR(50) NULL,
        color VARCHAR(50) NULL,
        view_angle VARCHAR(50) NULL,
        base_price DECIMAL(10,2) DEFAULT 5.99,
        design_price DECIMAL(10,2) DEFAULT 0.00,
        total_price DECIMAL(10,2) NULL,
        status VARCHAR(50) DEFAULT 'pending',
        source_designs TEXT NULL,
        quantity INT DEFAULT 1,
        created_at DATETIME,
        is_hidden TINYINT(1) DEFAULT 0,
        is_cart_order TINYINT(1) DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )");
    // Add is_hidden and is_cart_order if not exists
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN is_hidden TINYINT(1) DEFAULT 0");
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') === false) {
            error_log("Error adding is_hidden: " . $e->getMessage());
        }
    }
    try {
        $pdo->exec("ALTER TABLE orders ADD COLUMN is_cart_order TINYINT(1) DEFAULT 0");
    } catch (PDOException $e) {
        (strpos($e->getMessage(), 'Duplicate column name') === false) &&
            error_log("Error adding is_cart_order: " . $e->getMessage());
    }
} catch (PDOException $e) {
    error_log("Error creating/altering orders table: " . $e->getMessage());
    $error = "Database setup error";
}

// Check if user is logged in
if (!isset($_SESSION['email'])) {
    header('Location: login.php');
    exit();
}

// Get user details
try {
    $stmt = $pdo->prepare("SELECT id, firstname FROM users WHERE email = ?");
    $stmt->execute([$_SESSION['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        error_log("User not found for email: " . $_SESSION['email']);
        header('Location: login.php');
        exit();
    }
} catch (PDOException $e) {
    error_log("Error fetching user: " . $e->getMessage());
    $error = "Error fetching user data";
}

// Helper function to insert or update orders
function handleOrder($pdo, $user_id, $front_design, $back_design, $left_design, $right_design, $base_price, $design_price, $total_price, $source_designs_json = null, $quantity = 1, $is_hidden = 0, $is_cart_order = 0, $check_duplicate = true) {
    $front_design = $front_design ?? '';
    $back_design = $back_design ?? '';
    $left_design = $left_design ?? '';
    $right_design = $right_design ?? '';

    try {
        if ($check_duplicate) {
            // Check for duplicates only for combine actions
            $stmt = $pdo->prepare("
                SELECT id, quantity, total_price 
                FROM orders 
                WHERE user_id = ? 
                AND COALESCE(front_design, '') = ? 
                AND COALESCE(back_design, '') = ? 
                AND COALESCE(left_design, '') = ? 
                AND COALESCE(right_design, '') = ? 
                AND status = 'pending'
                AND is_hidden = ?
                AND is_cart_order = ?
                ORDER BY created_at DESC
                LIMIT 1
            ");
            $stmt->execute([$user_id, $front_design, $back_design, $left_design, $right_design, $is_hidden, $is_cart_order]);
            $existing_order = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing_order) {
                $new_quantity = $existing_order['quantity'] + $quantity;
                $new_total_price = ($base_price + $design_price) * $new_quantity;

                $stmt = $pdo->prepare("
                    UPDATE orders 
                    SET quantity = ?, total_price = ?
                    WHERE id = ?
                ");
                $stmt->execute([$new_quantity, $new_total_price, $existing_order['id']]);
                return $existing_order['id'];
            }
        }

        // Insert new order
        $stmt = $pdo->prepare("
            INSERT INTO orders (
                user_id, front_design, back_design, left_design, right_design, 
                base_price, design_price, total_price, status, source_designs, 
                quantity, created_at, is_hidden, is_cart_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW(), ?, ?)
        ");
        $stmt->execute([
            $user_id, 
            $front_design ?: null, 
            $back_design ?: null, 
            $left_design ?: null, 
            $right_design ?: null, 
            $base_price, 
            $design_price, 
            $total_price, 
            $source_designs_json, 
            $quantity,
            $is_hidden,
            $is_cart_order
        ]);
        return $pdo->lastInsertId();
    } catch (PDOException $e) {
        error_log("Error in handleOrder: " . $e->getMessage());
        throw new Exception("Database error: " . $e->getMessage());
    }
}

// ... existing code ...
// (The rest of your posted design.php code goes here, unchanged)
// ... existing code ... 