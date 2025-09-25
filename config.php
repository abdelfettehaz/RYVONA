<?php
// Database configuration
$host ="sql204.infinityfree.com";
$dbname = "if0_39992261_tshirt_designer";
$username = "if0_39992261";
$password = "97328989AZZouz";

try {
    // First connect without database to create it if needed
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname");
    
    // Now connect to the specific database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create users table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        firstname VARCHAR(50),
        lastname VARCHAR(50),
        phone VARCHAR(20) DEFAULT NULL,
        country VARCHAR(50) DEFAULT NULL,
        city VARCHAR(50) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        postal VARCHAR(50) DEFAULT NULL,
        cin integer,    
        profile_picture VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(100),
        reset_token VARCHAR(100),
        reset_token_expiry DATETIME,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS gallery_ratings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        gallery_template_id INT NOT NULL,
        rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (gallery_template_id) REFERENCES Gallery_template(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_rating (user_id, gallery_template_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

    // Create user_tokens table for authentication
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    // Create saved_designs table
    $pdo->exec("CREATE TABLE IF NOT EXISTS saved_designs (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        filename varchar(255) NOT NULL,
        product_type varchar(50) DEFAULT NULL,
        color varchar(50) DEFAULT NULL,
        size varchar(50),
        view_angle varchar(50) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY view_angle (view_angle)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;");
    
    // Create orders table
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        status enum('pending','under review','approved','rejected') COLLATE utf8mb4_general_ci DEFAULT 'under review',
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        quantity int(11) DEFAULT 1,
        design_data longtext COLLATE utf8mb4_bin DEFAULT NULL,
        final_price decimal(10,2) DEFAULT NULL,
        left_design varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
        right_design varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
        source_designs text COLLATE utf8mb4_general_ci DEFAULT NULL,
        front_design varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
        back_design varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
        base_price decimal(10,2) DEFAULT 0.00,
        design_price decimal(10,2) DEFAULT 0.00,
        total_price decimal(10,2) DEFAULT 0.00,
        updated_at timestamp NULL DEFAULT NULL,
        product_type varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
        color varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
        view_angle varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
        is_hidden tinyint(1) DEFAULT 0,
        is_cart_order tinyint(1) DEFAULT 0,
        size varchar(50),
        approval_timestamp timestamp NULL DEFAULT NULL,
        design_card_html longtext default NULL,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;");
    
    // Create orders_admin table
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders_admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT NOT NULL,
        client_name VARCHAR(100) NOT NULL,
        client_email VARCHAR(100) NOT NULL,
        status ENUM('under review', 'rejected', 'confirmed') DEFAULT 'under review',
        quantity INT DEFAULT 1,
        size varchar(50),
        front_design TEXT,
        back_design TEXT,
        left_design TEXT,
        right_design TEXT,
        design_data JSON,
        source_designs JSON,
        base_price DECIMAL(10,2) DEFAULT 0.00,
        design_price DECIMAL(10,2) DEFAULT 0.00,
        total_price DECIMAL(10,2) DEFAULT 0.00,
        product_type VARCHAR(50) DEFAULT 'T-shirt',
        color VARCHAR(50),
        view_angle VARCHAR(50),
        is_hidden BOOLEAN DEFAULT FALSE,
        is_cart_order BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    // Create categories table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    // Create Gallery_template table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS Gallery_template (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category_id INT,
        image_url VARCHAR(255) NOT NULL,
        thumbnail_url VARCHAR(255),
        status ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
        design_border_color VARCHAR(20) DEFAULT '#FF5722',
        design_border_width INT DEFAULT 5,
        design_border_style ENUM('solid', 'dashed', 'dotted', 'double') DEFAULT 'solid',
        price DECIMAL(10, 2),
        tags JSON,
        is_featured BOOLEAN DEFAULT FALSE,
        views INT DEFAULT 0,
        downloads INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    // Create tshirt_templates table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS tshirt_templates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url VARCHAR(255) NOT NULL,
        status ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        related_id INT DEFAULT NULL,
        type ENUM('message', 'order', 'system') DEFAULT 'message',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    // Create conversations table for chat functionality
    $pdo->exec("CREATE TABLE IF NOT EXISTS conversations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        admin_id INT NULL,
        status ENUM('open', 'closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
    // Create messages table for chat functionality
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image_url VARCHAR(50) DEFAULT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");
    
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die("MySQLi Connection failed: " . $conn->connect_error);
}
?>
