import React, { useState } from 'react';
import { Wand2, Plus, X } from 'lucide-react';

interface PromptEnhancerProps {
  onEnhancePrompt: (enhancedPrompt: string) => void;
  currentPrompt: string;
  isGenerating: boolean;
}

export const PromptEnhancer: React.FC<PromptEnhancerProps> = ({ 
  onEnhancePrompt, 
  currentPrompt, 
  isGenerating 
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const qualityTags = [
    '8K resolution', 'ultra detailed', 'masterpiece', 'best quality',
    'professional photography', 'award winning', 'highly detailed',
    'sharp focus', 'perfect composition'
  ];

  const lightingTags = [
    'golden hour lighting', 'dramatic lighting', 'soft natural light',
    'cinematic lighting', 'studio lighting', 'volumetric lighting',
    'rim lighting', 'ambient lighting'
  ];

  const styleTags = [
    'hyperrealistic', 'photorealistic', 'cinematic', 'artistic',
    'vibrant colors', 'moody atmosphere', 'ethereal', 'surreal',
    'minimalist', 'maximalist'
  ];

  const cameraSettings = [
    'shot on Canon EOS R5', 'shot on Sony A7R IV', '85mm lens',
    'shallow depth of field', 'bokeh background', 'macro photography',
    'wide angle shot', 'telephoto lens'
  ];

  const allTags = [
    { category: 'Quality', tags: qualityTags },
    { category: 'Lighting', tags: lightingTags },
    { category: 'Style', tags: styleTags },
    { category: 'Camera', tags: cameraSettings },
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const enhancePrompt = () => {
    const enhanced = selectedTags.length > 0 
      ? `${currentPrompt}, ${selectedTags.join(', ')}`
      : currentPrompt;
    onEnhancePrompt(enhanced);
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wand2 className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Prompt Enhancer</h3>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={clearTags}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {allTags.map(({ category, tags }) => (
          <div key={category} className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  disabled={isGenerating}
                  className={`px-3 py-1 text-xs rounded-full border transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? 'bg-purple-500 border-purple-500 text-white'
                      : 'bg-white/10 border-white/20 text-slate-300 hover:bg-white/20 hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {selectedTags.includes(tag) ? (
                    <span className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <X className="h-3 w-3" />
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1">
                      <Plus className="h-3 w-3" />
                      <span>{tag}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Selected enhancements:</h4>
          <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-sm text-slate-300">{selectedTags.join(', ')}</p>
          </div>
          <button
            onClick={enhancePrompt}
            disabled={isGenerating}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Apply Enhancements
          </button>
        </div>
      )}
    </div>
  );
}; 