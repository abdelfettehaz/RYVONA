import { Language } from '../types/chat';

export const detectLanguage = (text: string): Language => {
  // Check for Arabic characters
  return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en';
};

export const getLocalizedContent = () => ({
  en: {
    title: 'T-Shirt Design Assistant',
    welcome: 'Hello! I\'m your T-Shirt Design Assistant. How can I help you create amazing designs today?',
    placeholder: 'Type your message...',
    processing: 'Thinking...',
    error: 'Sorry, I encountered an error. Please try again.',
    languageSwitch: 'Language switched to English',
    helpCommand: 'Ask me about:\n• Design ideas and inspiration\n• Pricing and bulk orders\n• Order status and tracking\n• Customization options\n• Size and color selection',
    send: 'Send',
    languageToggle: 'العربية'
  },
  ar: {
    title: 'مساعد تصميم التيشيرتات',
    welcome: 'مرحباً! أنا مساعدك لتصميم التيشيرتات. كيف يمكنني مساعدتك في إنشاء تصاميم رائعة اليوم؟',
    placeholder: 'اكتب رسالتك...',
    processing: 'جاري التفكير...',
    error: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.',
    languageSwitch: 'تم التغيير إلى العربية',
    helpCommand: 'اسألني عن:\n• أفكار وإلهام التصميم\n• الأسعار والطلبات الكبيرة\n• حالة وتتبع الطلبات\n• خيارات التخصيص\n• اختيار الأحجام والألوان',
    send: 'إرسال',
    languageToggle: 'English'
  }
});