<?php
// Database configuration for Docker environment
$host = getenv('DB_HOST') ?: "mysql";
$dbname = getenv('DB_NAME') ?: "tshirt_designer";
$username = getenv('DB_USER') ?: "tshirt_user";
$password = getenv('DB_PASS') ?: "tshirt_pass";

try {
    // First connect without database to create it if needed
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    // Now connect to the specific database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Create all necessary tables
    
    // Users table
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
        cin INTEGER,
        age INTEGER,
        gender ENUM('male', 'female', 'other') DEFAULT 'other',
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // User tokens table for authentication
    $pdo->exec("CREATE TABLE IF NOT EXISTS user_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(64) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Categories table
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Saved designs table
    $pdo->exec("CREATE TABLE IF NOT EXISTS saved_designs (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        filename varchar(255) NOT NULL,
        product_type varchar(50) DEFAULT NULL,
        color varchar(50) DEFAULT NULL,
        size varchar(50) DEFAULT 'M',
        view_angle varchar(50) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        KEY user_id (user_id),
        KEY view_angle (view_angle),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
    
    // Orders table
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        status enum('pending','under review','approved','rejected','confirmed','submitted_for_review') COLLATE utf8mb4_general_ci DEFAULT 'under review',
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
        size varchar(50) DEFAULT 'M',
        approval_timestamp timestamp NULL DEFAULT NULL,
        design_card_html longtext default NULL,
        deleted_at timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci");
    
    // Orders admin table
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders_admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        order_id INT NOT NULL,
        client_name VARCHAR(100) NOT NULL,
        client_email VARCHAR(100) NOT NULL,
        status ENUM('under review', 'rejected', 'confirmed') DEFAULT 'under review',
        quantity INT DEFAULT 1,
        size varchar(50) DEFAULT 'M',
        phone VARCHAR(20) DEFAULT NULL,
        country VARCHAR(50) DEFAULT NULL,
        city VARCHAR(50) DEFAULT NULL,
        address TEXT DEFAULT NULL,
        postal VARCHAR(50) DEFAULT NULL,
        cin INTEGER DEFAULT NULL,
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
        currency VARCHAR(3) DEFAULT 'EUR',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Gallery template table
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
        price DECIMAL(10, 2) DEFAULT 15.98,
        size VARCHAR(50) DEFAULT 'M',
        tags JSON,
        is_featured BOOLEAN DEFAULT FALSE,
        views INT DEFAULT 0,
        downloads INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Gallery ratings table
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // T-shirt templates table
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Conversations table for chat functionality
    $pdo->exec("CREATE TABLE IF NOT EXISTS conversations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        admin_id INT NULL,
        status ENUM('open', 'closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Messages table for chat functionality
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image_url VARCHAR(255) DEFAULT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Notifications table
    $pdo->exec("CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        related_id INT DEFAULT NULL,
        type ENUM('message', 'order', 'system') DEFAULT 'message',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Insert default categories
    $pdo->exec("INSERT IGNORE INTO categories (id, name, description) VALUES
        (1, 'Business', 'Professional and corporate designs'),
        (2, 'Casual', 'Everyday wear and lifestyle designs'),
        (3, 'Sports', 'Athletic and fitness related designs'),
        (4, 'Artistic', 'Creative and artistic expressions')");
    
    // Insert default admin user (password: admin123)
    $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (id, email, password, firstname, lastname, role, status) VALUES (3, 'admin@ryvona.com', ?, 'Admin', 'User', 'admin', 'active')");
    $stmt->execute([$hashedPassword]);
    
    // Create MySQLi connection for backward compatibility
    $conn = new mysqli($host, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("MySQLi Connection failed: " . $conn->connect_error);
    }
    $conn->set_charset("utf8mb4");
    
} catch(PDOException $e) {
    error_log("Database connection error: " . $e->getMessage());
    die("Database connection failed. Please check your configuration.");
} catch(Exception $e) {
    error_log("General error: " . $e->getMessage());
    die("Configuration error: " . $e->getMessage());
}
?>