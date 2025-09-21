import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message as MessageType } from '../types/chat';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isArabic = message.language === 'ar';
  
  return (
    <div className={`flex gap-3 mb-4 ${message.isUser ? 'flex-row-reverse' : ''} ${isArabic ? 'text-right' : 'text-left'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        message.isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
        message.isUser 
          ? 'bg-blue-500 text-white rounded-br-md' 
          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
      } ${isArabic ? 'direction-rtl' : ''}`}>
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {message.content}
        </div>
        <div className={`text-xs mt-2 opacity-70 ${
          message.isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};