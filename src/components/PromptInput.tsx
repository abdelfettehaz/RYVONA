import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Wand2, Shuffle } from 'lucide-react';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  initialPrompt?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ 
  onGenerate, 
  isGenerating, 
  initialPrompt = '' 
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(prompt);
  };

  const professionalPrompts = [
    "A stunning portrait of a woman with flowing hair, golden hour lighting, shot on Canon EOS R5, 85mm lens, shallow depth of field, professional photography, award winning, 8K resolution",
    "Futuristic cyberpunk cityscape at night, neon lights reflecting on wet streets, dramatic lighting, cinematic composition, ultra detailed, masterpiece quality, shot on Sony A7R IV",
    "Majestic mountain landscape during sunrise, misty valleys, dramatic clouds, professional landscape photography, vibrant colors, sharp focus, best quality, 8K resolution",
    "Elegant minimalist interior design, modern architecture, natural lighting, clean lines, professional architectural photography, award winning composition, ultra detailed",
    "Abstract digital art with flowing geometric patterns, vibrant rainbow colors, ethereal atmosphere, masterpiece quality, highly detailed, artistic composition",
    "Professional food photography of gourmet dish, studio lighting, perfect composition, mouth-watering presentation, commercial quality, shot on Canon EOS R5, macro lens",
    "Mystical forest scene with ancient trees, magical atmosphere, volumetric lighting, cinematic mood, fantasy art style, ultra detailed, award winning photography",
    "High-fashion portrait with dramatic makeup, studio lighting, professional model photography, editorial style, shot on medium format camera, best quality"
  ];

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    onGenerate(examplePrompt);
  };

  const generateRandomPrompt = () => {
    const randomPrompt = professionalPrompts[Math.floor(Math.random() * professionalPrompts.length)];
    setPrompt(randomPrompt);
    onGenerate(randomPrompt);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Wand2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">RYVONA - Tunisian AI Studio</h2>
            <p className="text-slate-400">✨ Let Your Absolute Imagination Take Its Freedom - Where Dreams Become Visual Masterpieces ✨</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your image in detail for best results. Include style, lighting, quality, and technical details..."
            className="w-full h-40 p-4 pr-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
            disabled={isGenerating}
            maxLength={1000}
          />
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <button
              type="button"
              onClick={generateRandomPrompt}
              disabled={isGenerating}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              title="Random prompt"
            >
              <Shuffle className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300 group"
            >
              {isGenerating ? (
                <Sparkles className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            {prompt.length}/1000 characters
          </span>
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isGenerating ? (
              <span className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 animate-spin" />
                <span>Generating...</span>
              </span>
            ) : (
              'Generate Professional Image'
            )}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <span>Professional Examples:</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {professionalPrompts.slice(0, 6).map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isGenerating}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-slate-300 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-left hover:border-purple-400/50 line-clamp-3"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}; 