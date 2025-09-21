<?php
// Error handling for API
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$error_code = http_response_code();
$error_message = "";

switch ($error_code) {
    case 404:
        $error_message = "API endpoint not found";
        break;
    case 500:
        $error_message = "Internal server error";
        break;
    case 403:
        $error_message = "Access forbidden";
        break;
    case 401:
        $error_message = "Unauthorized access";
        break;
    default:
        $error_message = "An error occurred";
        break;
}

echo json_encode([
    'success' => false,
    'error' => $error_message,
    'code' => $error_code,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
