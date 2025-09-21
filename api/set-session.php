<?php
session_start();
$data = json_decode(file_get_contents('php://input'), true);
if (isset($data['firstname'], $data['lastname'], $data['email'], $data['id'], $data['role'])) {
    $_SESSION['user'] = $data;
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Missing user data']);
} 