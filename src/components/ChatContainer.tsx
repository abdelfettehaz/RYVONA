import React, { useState, useRef, useEffect } from 'react';
import { Message, Language } from '../types/chat';
import { getLocalizedContent } from '../utils/languageUtils';
import { ChatHeader } from './ChatHeader';
import { Message as MessageComponent } from './Message';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const content = getLocalizedContent();

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      content: content[language].welcome,
      isUser: false,
      timestamp: new Date(),
      language
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  /* const _handleSendMessage = async (messageText: string) => {
    // Handle special commands
    if (messageText === '/help') {
      const helpMessage: Message = {
        id: Date.now().toString(),
        content: content[language].helpCommand,
        isUser: false,
        timestamp: new Date(),
        language
      };
      setMessages(prev => [...prev, helpMessage]);
      return;
    }

    // Detect language from user input
    const detectedLang = detectLanguage(messageText);
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
      language: detectedLang
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      // Try local response first for common queries
      let response = AIService.getLocalResponse(messageText, detectedLang);
      
      // If no local response, get AI response
      if (!response) {
        response = await AIService.getAIResponse(messageText, detectedLang);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
        language: detectedLang
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: content[detectedLang].error,
        isUser: false,
        timestamp: new Date(),
        language: detectedLang
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }; */

  const handleLanguageToggle = () => {
    const newLanguage: Language = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    
    const switchMessage: Message = {
      id: Date.now().toString(),
      content: content[newLanguage].languageSwitch,
      isUser: false,
      timestamp: new Date(),
      language: newLanguage
    };
    setMessages(prev => [...prev, switchMessage]);
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white shadow-2xl">
      <ChatHeader language={language} onLanguageToggle={handleLanguageToggle} />
      
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
        {messages.map((message) => (
          <MessageComponent key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator isTyping={isLoading} />}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        value=""
        onChange={() => {}}
        onSend={() => {}}
        disabled={isLoading}
      />
    </div>
  );
};