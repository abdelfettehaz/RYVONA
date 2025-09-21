<?php
require_once __DIR__ . '/config1.php';

$apiKey = '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';
$model = 'deepseek/deepseek-r1-0528:free';
$apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

// System prompt: describe the website for the AI
$systemPrompt = "You are a helpful AI assistant for the RYVONA website, a Tunisian AI-powered design studio. You know everything about the website, its features, how to use it, and can answer any question about it. Always be clear, friendly, and concise.";

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['message']) || empty(trim($input['message']))) {
    http_response_code(400);
    echo json_encode(['error' => 'No message provided.']);
    exit;
}
$userMessage = $input['message'];
$pageTitle = isset($input['pageTitle']) ? $input['pageTitle'] : '';
$pageUrl = isset($input['pageUrl']) ? $input['pageUrl'] : '';

// Build system prompt with page context
$systemPrompt = "You are a helpful AI assistant for the RYVONA website, a Tunisian AI-powered design studio. You know everything about the website, its features, how to use it, and can answer any question about it. Always be clear, friendly, and concise.";
if ($pageTitle || $pageUrl) {
    $systemPrompt .= " The user is currently on the page: '" . $pageTitle . "' (" . $pageUrl . "). Give answers relevant to this page when possible.";
}

// Prepare API request
$postData = [
    'model' => $model,
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userMessage]
    ]
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'HTTP-Referer: http://localhost:5173', // Change to your actual site URL in production
    'X-Title: RYVONA',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Curl error: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}
curl_close($ch);

if ($httpCode !== 200) {
    http_response_code($httpCode);
    echo json_encode(['error' => 'API error', 'details' => $response]);
    exit;
}

$data = json_decode($response, true);
$reply = $data['choices'][0]['message']['content'] ?? 'Sorry, I could not get a response.';
echo json_encode(['reply' => $reply]); 