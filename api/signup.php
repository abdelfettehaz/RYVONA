<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

require_once __DIR__ . '/../config.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get and validate JSON input
$json = file_get_contents('php://input');
$input = json_decode($json, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit();
}

// Validate required fields
$requiredFields = ['email', 'password', 'firstname', 'lastname', 'phone', 'address', 'city', 'country', 'postal', 'cin', 'age', 'gender'];
foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => ucfirst($field) . ' is required']);
        exit();
    }
}

$email = isset($input['email']) ? filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL) : null;
$password = $input['password'] ?? null;
$firstname = isset($input['firstname']) ? htmlspecialchars(trim($input['firstname']), ENT_QUOTES, 'UTF-8') : null;
$lastname = isset($input['lastname']) ? htmlspecialchars(trim($input['lastname']), ENT_QUOTES, 'UTF-8') : null;
$phone = isset($input['phone']) ? preg_replace('/[^0-9+]/', '', trim($input['phone'])) : null;
$address = isset($input['address']) ? htmlspecialchars(trim($input['address']), ENT_QUOTES, 'UTF-8') : null;
$city = isset($input['city']) ? htmlspecialchars(trim($input['city']), ENT_QUOTES, 'UTF-8') : null;
$country = isset($input['country']) ? htmlspecialchars(trim($input['country']), ENT_QUOTES, 'UTF-8') : null;
$postal = isset($input['postal']) ? htmlspecialchars(trim($input['postal']), ENT_QUOTES, 'UTF-8') : null;
$cin = isset($input['cin']) ? preg_replace('/[^0-9]/', '', trim($input['cin'])) : null;
$age = isset($input['age']) ? intval($input['age']) : null;
$gender = isset($input['gender']) ? htmlspecialchars(trim($input['gender']), ENT_QUOTES, 'UTF-8') : null;

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Validate password strength
if (strlen($password) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters long']);
    exit();
}

// Validate phone number
if (empty($phone) || !preg_match('/^\+?[0-9]{7,15}$/', $phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
    exit();
}

// Validate CIN
if (!preg_match('/^[0-9]{8,20}$/', $cin)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'CIN must be 8-20 digits']);
    exit();
}

// Validate age
if ($age < 1 || $age > 120) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Age must be between 1 and 120']);
    exit();
}

// Validate gender
if (!in_array($gender, ['male', 'female', 'other'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid gender selection']);
    exit();
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email already registered']);
        exit();
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $pdo->prepare("
        INSERT INTO users 
        (email, password, firstname, lastname, phone, address, city, country, postal, cin, age, gender, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    ");
    
    $stmt->execute([$email, $hashedPassword, $firstname, $lastname, $phone, $address, $city, $country, $postal, $cin, $age, $gender]);
    $userId = $pdo->lastInsertId();

    // Create a conversation for the new user
    $stmt = $pdo->prepare("
        INSERT INTO conversations 
        (user_id, status, created_at) 
        VALUES (?, 'open', NOW())
    ");
    $stmt->execute([$userId]);
    $conversationId = $pdo->lastInsertId();

    // Generate token
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', strtotime('+30 days'));

    // Store token
    $stmt = $pdo->prepare("
        INSERT INTO user_tokens (user_id, token, expires_at) 
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$userId, $token, $expiresAt]);

    // Get created user data (without sensitive info)
    $stmt = $pdo->prepare("
        SELECT id, email, firstname, lastname, phone, address, city, country, postal, cin, role, 
               profile_picture, created_at 
        FROM users 
        WHERE id = ?
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Commit transaction
    $pdo->commit();

    // Successful response
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully',
        'data' => [
            'user' => $user,
            'token' => $token,
            'expires_at' => $expiresAt,
            'conversation_id' => $conversationId
        ]
    ]);

} catch (PDOException $e) {
    // Rollback transaction if error occurs
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Database error in signup: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred']);
} catch (Exception $e) {
    // Rollback transaction if error occurs
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log("Error in signup: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred']);
}
?>