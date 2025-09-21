import React from 'react';
import { Languages, Shirt } from 'lucide-react';
import { Language } from '../types/chat';
import { getLocalizedContent } from '../utils/languageUtils';

interface ChatHeaderProps {
  language: Language;
  onLanguageToggle: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ language, onLanguageToggle }) => {
  const content = getLocalizedContent();

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <Shirt className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg">{content[language].title}</h1>
          <p className="text-blue-100 text-sm">Powered by DeepSeek AI</p>
        </div>
      </div>
      
      <button
        onClick={onLanguageToggle}
        className="flex items-center gap-2 px-3 py-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all"
        title="Switch Language"
      >
        <Languages className="w-4 h-4" />
        <span className="text-sm font-medium">{content[language].languageToggle}</span>
      </button>
    </div>
  );
};