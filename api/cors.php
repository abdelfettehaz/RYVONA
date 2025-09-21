<?php
// CORS Configuration for Production
// Include this file at the top of your PHP API files

// Get the frontend URL from environment or set default
$frontend_url = $_ENV['FRONTEND_URL'] ?? 'https://your-project.vercel.app';

// Set CORS headers
header("Access-Control-Allow-Origin: $frontend_url");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set content type for JSON responses
header('Content-Type: application/json; charset=utf-8');

// Add security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
?>
