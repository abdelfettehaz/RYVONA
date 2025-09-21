<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Include PHPMailer files
require '../mailer/phpmailer/phpmailer/src/Exception.php';
require '../mailer/phpmailer/phpmailer/src/PHPMailer.php';
require '../mailer/phpmailer/phpmailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }
    
    // Validate required fields
    $required_fields = ['name', 'email', 'subject', 'message'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }
    
    // Validate email
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }
    
    // Sanitize inputs
    $name = htmlspecialchars(trim($input['name']));
    $email = filter_var(trim($input['email']), FILTER_SANITIZE_EMAIL);
    $subject = htmlspecialchars(trim($input['subject']));
    $message = htmlspecialchars(trim($input['message']));
    
    // Create PHPMailer instance
    $mail = new PHPMailer(true);
    
    // Server settings
    $mail->SMTPDebug = 0;
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'abdelfettehazouz838@gmail.com';
    $mail->Password = 'buxeyavsnykulmor';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;
    $mail->isHTML(true);
    
    // Set sender and recipient
    $mail->setFrom($email, $name);
    $mail->addAddress('abdelfettehazouz838@gmail.com');
    
    // Set email content
    $mail->Subject = $subject;
    $mail->Body = "
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>Email:</strong> {$email}</p>
        <p><strong>Subject:</strong> {$subject}</p>
        <p><strong>Message:</strong></p>
        <p>" . nl2br($message) . "</p>
        <hr>
        <p><em>This email was sent from the T-Shirt Designer contact form.</em></p>
    ";
    $mail->AltBody = "
        New Contact Form Submission
        
        Name: {$name}
        Email: {$email}
        Subject: {$subject}
        Message: {$message}
        
        This email was sent from the T-Shirt Designer contact form.
    ";
    
    // Send email
    if ($mail->send()) {
        echo json_encode([
            'success' => true,
            'message' => 'Your message was sent successfully! We will get back to you soon.'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Message could not be sent. Error: ' . $e->getMessage()
    ]);
}
?> 