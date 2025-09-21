<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// AI Model Configuration
define('AI_MODEL', 'deepseek/deepseek-r1-0528:free');
define('AI_API_KEY', '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');
define('DEFAULT_LANGUAGE', 'en');

// Website Navigation Knowledge
$websiteNavigation = [
    'en' => [
        'design_studio' => [
            'path' => '/design',
            'description' => 'Click on "Design Studio" in the navigation menu to start creating your custom t-shirt design.',
            'keywords' => ['design', 'create', 'make', 'start designing', 'customize', 'studio']
        ],
        'templates' => [
            'path' => '/templates',
            'description' => 'Browse our templates by clicking "Templates" in the navigation menu.',
            'keywords' => ['templates', 'premade', 'designs', 'examples']
        ],
        'gallery' => [
            'path' => '/gallery',
            'description' => 'View our gallery of designs by clicking "Gallery" in the navigation menu.',
            'keywords' => ['gallery', 'view', 'see', 'examples', 'showcase']
        ],
        'pricing' => [
            'path' => '/pricing',
            'description' => 'Check our pricing by clicking "Pricing" in the navigation menu.',
            'keywords' => ['price', 'cost', 'how much', 'pricing']
        ],
        'login' => [
            'path' => '/login',
            'description' => 'Click the "Login" button in the top right corner to access your account.',
            'keywords' => ['login', 'sign in', 'account', 'profile']
        ]
    ],
    'ar' => [
        'design_studio' => [
            'path' => '/design',
            'description' => 'انقر على "استوديو التصميم" في القائمة للبدء في إنشاء تصميم قميصك المخصص.',
            'keywords' => ['تصميم', 'إنشاء', 'صنع', 'بدء التصميم', 'تخصيص', 'استوديو']
        ],
        'templates' => [
            'path' => '/templates',
            'description' => 'تصفح قوالبنا بالنقر على "القوالب" في القائمة.',
            'keywords' => ['قوالب', 'جاهزة', 'تصاميم', 'أمثلة']
        ],
        'gallery' => [
            'path' => '/gallery',
            'description' => 'شاهد معرض تصاميمنا بالنقر على "المعرض" في القائمة.',
            'keywords' => ['معرض', 'عرض', 'رؤية', 'أمثلة', 'عرض']
        ],
        'pricing' => [
            'path' => '/pricing',
            'description' => 'تحقق من أسعارنا بالنقر على "الأسعار" في القائمة.',
            'keywords' => ['سعر', 'تكلفة', 'كم', 'أسعار']
        ],
        'login' => [
            'path' => '/login',
            'description' => 'انقر على زر "تسجيل الدخول" في الزاوية العلوية اليمنى للوصول إلى حسابك.',
            'keywords' => ['تسجيل', 'دخول', 'حساب', 'ملف شخصي']
        ]
    ]
];

// Language-specific responses
$responses = [
    'en' => [
        'welcome' => 'Hi! I\'m your T-Shirt Design Assistant. I can help you navigate our website and answer any questions about our services. What would you like to know?',
        'error' => 'I apologize, but I encountered an error. Could you please try asking your question again?',
        'processing' => 'Let me think about that...',
        'language_switch' => 'Language switched to English.',
        'help' => 'I can help you with:\n- Finding where to design your t-shirt\n- Checking prices\n- Viewing templates\n- Accessing your account\n- Any other questions about our services'
    ],
    'ar' => [
        'welcome' => 'مرحباً! أنا مساعدك لتصميم التيشيرتات. يمكنني مساعدتك في التنقل في موقعنا والإجابة على أي أسئلة حول خدماتنا. كيف يمكنني مساعدتك؟',
        'error' => 'عذراً، واجهت خطأ. هل يمكنك إعادة طرح سؤالك؟',
        'processing' => 'دعني أفكر في ذلك...',
        'language_switch' => 'تم التغيير إلى العربية.',
        'help' => 'يمكنني مساعدتك في:\n- العثور على مكان تصميم قميصك\n- التحقق من الأسعار\n- عرض القوالب\n- الوصول إلى حسابك\n- أي أسئلة أخرى حول خدماتنا'
    ]
];

// Function to find navigation-related answers
function findNavigationAnswer($message, $language) {
    global $websiteNavigation;
    $message = strtolower(trim($message));
    
    foreach ($websiteNavigation[$language] as $section => $info) {
        foreach ($info['keywords'] as $keyword) {
            if (strpos($message, $keyword) !== false) {
                return [
                    'response' => $info['description'],
                    'link' => $info['path']
                ];
            }
        }
    }
    
    return null;
}

// Function to call AI model with enhanced context
function getAIResponse($message, $language = 'en') {
    try {
        $apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
        
        $headers = [
            'Authorization: Bearer ' . AI_API_KEY,
            'Content-Type: application/json',
            'HTTP-Referer: ' . ($_SERVER['HTTP_REFERER'] ?? 'https://yourdomain.com'),
            'X-Title: T-Shirt Designer'
        ];

        // Enhanced system prompt with website knowledge
        $systemPrompt = "You are a helpful assistant for a T-shirt design website. " .
                       "The website has these main sections:\n" .
                       "- Design Studio (for creating custom designs)\n" .
                       "- Templates (for browsing pre-made designs)\n" .
                       "- Gallery (for viewing example designs)\n" .
                       "- Pricing (for checking costs)\n" .
                       "- Login (for accessing user accounts)\n" .
                       "When users ask about navigation, provide specific instructions like 'Click on X in the navigation menu' or 'Go to the X section'.\n" .
                       "Be friendly and precise in your responses. " .
                       "Respond in " . ($language === 'ar' ? 'Arabic' : 'English') . ".";

        $data = [
            'model' => AI_MODEL,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => $systemPrompt
                ],
                [
                    'role' => 'user',
                    'content' => $message
                ]
            ],
            'temperature' => 0.7,
            'max_tokens' => 300,
            'top_p' => 1,
            'frequency_penalty' => 0,
            'presence_penalty' => 0
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $apiEndpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_USERAGENT => 'T-Shirt Design Assistant/1.0'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if (curl_errno($ch)) {
            throw new Exception('API Connection Error: ' . curl_error($ch));
        }

        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("API Error $httpCode");
        }

        $result = json_decode($response, true);
        return trim($result['choices'][0]['message']['content']);

    } catch (Exception $e) {
        error_log('AI Error: ' . $e->getMessage());
        return getFallbackResponse($message, $language);
    }
}

// Local responses for common questions
function getLocalResponse($message, $language) {
    $common = [
        'en' => [
            'hello' => 'Hi! Ready to design some awesome T-shirts?',
            'hi' => 'Hello! Welcome to our T-shirt design studio. How can I assist you today?',
            'price' => 'Prices start at $9.99 for basic designs. Premium designs cost $15-30.',
            'pricing' => 'Here\'s our pricing:\n• Basic designs: $9.99\n• Custom designs: $15-25\n• Premium designs: $25-30\n• Bulk orders: Contact us for special rates',
            'design' => 'You can use our Design Studio or AI Generator!',
            'order' => 'Check your order status in "My Account". Need help?'
        ],
        'ar' => [
            'مرحبا' => 'مرحباً! مستعد لتصميم تيشيرتات رائعة؟',
            'السعر' => 'تبدأ الأسعار من 9.99$ للتصاميم الأساسية. التصاميم المميزة 15-30$.',
            'التصميم' => 'يمكنك استخدام استوديو التصميم أو المولد الذكي!',
            'الطلب' => 'تحقق من حالة الطلب في "حسابي". تحتاج مساعدة؟'
        ]
    ];

    $msg = strtolower(trim($message));
    return $common[$language][$msg] ?? null;
}

// Fallback when API fails
function getFallbackResponse($message, $language) {
    $fallbacks = [
        'en' => "I'm having trouble connecting to our AI service. Here's what I know:\n".
               "- Design Studio: Create custom designs\n".
               "- Prices: $9.99-$30\n".
               "- Contact: support@tshirt.example.com\n".
               "- Try asking again in a moment!",
        'ar' => "أواجه مشكلة في الاتصال بخدمة الذكاء الاصطناعي. إليك ما أعرفه:\n".
               "- استوديو التصميم: أنشئ تصاميمك\n".
               "- الأسعار: 9.99$-30$\n".
               "- الدعم: support@tshirt.example.com\n".
               "- جرب السؤال مرة أخرى بعد قليل!"
    ];
    return $fallbacks[$language];
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $message = trim($data['message'] ?? '');
    $language = $data['language'] ?? DEFAULT_LANGUAGE;

    if (empty($message)) {
        echo json_encode(['response' => $responses[$language]['error']]);
        exit;
    }

    // Check for navigation-related questions first
    $navAnswer = findNavigationAnswer($message, $language);
    if ($navAnswer) {
        echo json_encode([
            'response' => $navAnswer['response'],
            'link' => $navAnswer['link']
        ]);
        exit;
    }

    // Handle special commands
    if ($message === '/help') {
        echo json_encode(['response' => $responses[$language]['help']]);
        exit;
    }

    if ($message === '/switch') {
        $newLang = ($language === 'en') ? 'ar' : 'en';
        echo json_encode([
            'response' => $responses[$newLang]['language_switch'],
            'language' => $newLang
        ]);
        exit;
    }

    // Try local responses first
    $localResponse = getLocalResponse($message, $language);
    if ($localResponse) {
        echo json_encode(['response' => $localResponse]);
        exit;
    }

    // Get AI response
    $response = getAIResponse($message, $language);
    echo json_encode(['response' => $response]);
    exit;
}
?> 