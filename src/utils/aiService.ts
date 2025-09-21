import { Language } from '../types/chat';

const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL || 'deepseek/deepseek-chat';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

export class AIService {
  private static validateConfig(): void {
    if (!API_KEY) {
      throw new Error('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
    }
  }

  static async getAIResponse(message: string, language: Language = 'en'): Promise<string> {
    this.validateConfig();

    try {
      const systemPrompt = language === 'ar' 
        ? "أنت مساعد مفيد لشركة تصميم التيشيرتات. استجب باللغة العربية. كن مختصراً ومفيداً. ركز على تصميم التيشيرتات والتخصيص والأسعار ومعلومات الطلبات."
        : "You are a helpful assistant for a T-shirt design business. Respond in English. Be concise and helpful. Focus on T-shirt design, customization, pricing, and order information.";

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': APP_URL,
          'X-Title': 'T-Shirt Design Assistant'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 300,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response format');
      }

      return data.choices[0].message.content.trim();

    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(message, language);
    }
  }

  private static getFallbackResponse(_message: string, language: Language): string {
    const fallbacks = {
      en: "I'm having trouble connecting to our AI service right now. Here's what I can help with:\n\n" +
           "• Design Studio: Create custom T-shirt designs\n" +
           "• Pricing: Starting from $9.99 for basic designs, $15-30 for premium\n" +
           "• Customization: Choose colors, sizes, and add text or graphics\n" +
           "• Support: Contact our team at support@tshirtdesign.com",
      ar: "أواجه مشكلة في الاتصال بخدمة الذكاء الاصطناعي حالياً. إليك ما يمكنني مساعدتك به:\n\n" +
           "• استوديو التصميم: أنشئ تصاميم تيشيرت مخصصة\n" +
           "• الأسعار: تبدأ من 9.99$ للتصاميم الأساسية، 15-30$ للمميزة\n" +
           "• التخصيص: اختر الألوان والأحجام وأضف النصوص أو الرسوم\n" +
           "• الدعم: تواصل مع فريقنا على support@tshirtdesign.com"
    };
    
    return fallbacks[language];
  }

  static getLocalResponse(message: string, language: Language): string | null {
    const msg = message.toLowerCase().trim();
    
    const responses = {
      en: {
        'hello': 'Hi there! 👋 Ready to create some amazing T-shirt designs? I can help you with design ideas, pricing, and orders!',
        'hi': 'Hello! Welcome to our T-shirt design studio. How can I assist you today?',
        'price': 'Our T-shirt prices start at $9.99 for basic designs. Premium custom designs range from $15-30. Bulk orders get special discounts!',
        'pricing': 'Here\'s our pricing:\n• Basic designs: $9.99\n• Custom designs: $15-25\n• Premium designs: $25-30\n• Bulk orders: Contact us for special rates',
        'design': 'You can create designs using:\n• Our Design Studio (drag & drop interface)\n• AI Design Generator\n• Upload your own artwork\n• Choose from our template library',
        'order': 'To check your order status:\n1. Go to "My Account"\n2. Click "Order History"\n3. View tracking info\n\nNeed help? I\'m here to assist!',
        'help': 'I can help you with:\n• Design ideas and inspiration\n• Pricing and bulk orders\n• Order status and tracking\n• Customization options\n• Size and color selection'
      },
      ar: {
        'مرحبا': 'مرحباً بك! 👋 مستعد لإنشاء تصاميم تيشيرت رائعة؟ يمكنني مساعدتك في أفكار التصميم والأسعار والطلبات!',
        'السعر': 'تبدأ أسعار التيشيرتات من 9.99$ للتصاميم الأساسية. التصاميم المخصصة المميزة من 15-30$. خصومات خاصة للطلبات الكبيرة!',
        'التصميم': 'يمكنك إنشاء التصاميم باستخدام:\n• استوديو التصميم (واجهة سحب وإفلات)\n• مولد التصميم الذكي\n• رفع أعمالك الفنية\n• اختيار من مكتبة القوالب',
        'الطلب': 'لتتبع حالة طلبك:\n1. انتقل إلى "حسابي"\n2. اضغط على "تاريخ الطلبات"\n3. اعرض معلومات التتبع\n\nتحتاج مساعدة؟ أنا هنا!',
        'مساعدة': 'يمكنني مساعدتك في:\n• أفكار وإلهام التصميم\n• الأسعار والطلبات الكبيرة\n• حالة وتتبع الطلبات\n• خيارات التخصيص\n• اختيار الأحجام والألوان'
      }
    };

    return (responses[language] as any)[msg] || null;
  }
}