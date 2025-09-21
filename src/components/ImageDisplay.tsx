import React from 'react';
import { Download, Copy, Clock, Zap } from 'lucide-react';
import { GeneratedImage } from '../types/image';
import { useNavigate } from 'react-router-dom';

interface ImageDisplayProps {
  image: GeneratedImage | null;
  isGenerating: boolean;
}

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ image, isGenerating }) => {
  const navigate = useNavigate();

  const handleSaveToDesigns = async () => {
    if (!image) return;
    
    try {
      // Convert blob URL to base64
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        const payload = {
          image: base64Data,
          product: 'AI Generated',
          color: 'custom',
          view: 'front'
        };

        const saveResponse = await fetch('/api/save-design.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        });

        const data = await saveResponse.json();
        if (saveResponse.ok && data.success) {
          alert('Design saved to My Designs successfully!');
          navigate('/my-designs');
        } else {
          alert('Failed to save design: ' + (data.message || 'Unknown error'));
        }
      };
      
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Error saving design: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleCopyPrompt = () => {
    if (!image) return;
    navigator.clipboard.writeText(image.prompt);
  };

  if (isGenerating) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <Zap className="absolute inset-0 m-auto h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-white text-xl font-semibold">Generating your image...</p>
            <p className="text-slate-400">Flux.1 Schnell is working its magic</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <Clock className="h-4 w-4" />
              <span>Usually takes 10-30 seconds</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-300 text-lg font-medium">Ready to create something amazing?</p>
            <p className="text-slate-400">Enter a prompt above to generate your first image</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4">
      <div className="relative group">
        <img
          src={image.imageUrl}
          alt={image.prompt}
          className="w-full h-auto rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
          <div className="flex space-x-3">
            <button
              onClick={handleSaveToDesigns}
              className="p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors shadow-lg"
              title="Save to My Designs"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-400" />
            <span>Generated Image</span>
          </h3>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center space-x-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-slate-300 hover:text-white transition-colors border border-white/10 hover:border-white/20"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Prompt</span>
          </button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-slate-300 leading-relaxed">{image.prompt}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Generated with Flux.1 Schnell</span>
          <span>
            {image.createdAt.toLocaleDateString()} at {image.createdAt.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}; 