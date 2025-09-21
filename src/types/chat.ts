export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  language: 'en' | 'ar';
}

export interface ChatResponse {
  response: string;
  language?: 'en' | 'ar';
}

export type Language = 'en' | 'ar';

export interface LocalizedContent {
  en: Record<string, string>;
  ar: Record<string, string>;
}