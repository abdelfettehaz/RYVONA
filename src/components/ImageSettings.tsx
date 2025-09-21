import React from 'react';
import { Settings, Palette, Maximize, Layers } from 'lucide-react';

interface ImageSettingsProps {
  settings: {
    aspectRatio: string;
    quality: string;
    style: string;
    steps: number;
  };
  onSettingsChange: (settings: any) => void;
  isGenerating: boolean;
}

export const ImageSettings: React.FC<ImageSettingsProps> = ({ 
  settings, 
  onSettingsChange, 
  isGenerating 
}) => {
  const aspectRatios = [
    { value: '1:1', label: 'Square (1:1)', width: 1024, height: 1024 },
    { value: '16:9', label: 'Landscape (16:9)', width: 1344, height: 768 },
    { value: '9:16', label: 'Portrait (9:16)', width: 768, height: 1344 },
    { value: '4:3', label: 'Standard (4:3)', width: 1152, height: 896 },
    { value: '3:2', label: 'Photo (3:2)', width: 1216, height: 832 },
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard', steps: 1 },
    { value: 'high', label: 'High Quality', steps: 2 },
    { value: 'ultra', label: 'Ultra HD', steps: 4 },
  ];

  const styleOptions = [
    { value: 'photorealistic', label: 'Photorealistic' },
    { value: 'artistic', label: 'Artistic' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'anime', label: 'Anime/Manga' },
    { value: 'digital-art', label: 'Digital Art' },
    { value: 'oil-painting', label: 'Oil Painting' },
    { value: 'watercolor', label: 'Watercolor' },
    { value: 'sketch', label: 'Sketch' },
  ];

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    
    // Auto-adjust steps based on quality for Flux.1 Schnell
    if (key === 'quality') {
      const qualityOption = qualityOptions.find(q => q.value === value);
      if (qualityOption) {
        newSettings.steps = qualityOption.steps;
      }
    }
    
    onSettingsChange(newSettings);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Image Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
            <Maximize className="h-4 w-4" />
            <span>Aspect Ratio</span>
          </label>
          <select
            value={settings.aspectRatio}
            onChange={(e) => handleSettingChange('aspectRatio', e.target.value)}
            disabled={isGenerating}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {aspectRatios.map((ratio) => (
              <option key={ratio.value} value={ratio.value} className="bg-slate-800">
                {ratio.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quality */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
            <Layers className="h-4 w-4" />
            <span>Quality</span>
          </label>
          <select
            value={settings.quality}
            onChange={(e) => handleSettingChange('quality', e.target.value)}
            disabled={isGenerating}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {qualityOptions.map((quality) => (
              <option key={quality.value} value={quality.value} className="bg-slate-800">
                {quality.label}
              </option>
            ))}
          </select>
        </div>

        {/* Style */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
            <Palette className="h-4 w-4" />
            <span>Style</span>
          </label>
          <select
            value={settings.style}
            onChange={(e) => handleSettingChange('style', e.target.value)}
            disabled={isGenerating}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {styleOptions.map((style) => (
              <option key={style.value} value={style.value} className="bg-slate-800">
                {style.label}
              </option>
            ))}
          </select>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm font-medium text-slate-300">
            <Settings className="h-4 w-4" />
            <span>Steps: {settings.steps}</span>
          </label>
          <input
            type="range"
            min="1"
            max="4"
            value={settings.steps}
            onChange={(e) => handleSettingChange('steps', parseInt(e.target.value))}
            disabled={isGenerating}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Fast (1)</span>
            <span>Best (4)</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-400 bg-white/5 p-3 rounded-lg">
        <p><strong>Note:</strong> Flux.1 Schnell is optimized for speed with 1-4 steps. 
        Higher step counts provide more detail but take longer to generate.</p>
      </div>
    </div>
  );
}; 