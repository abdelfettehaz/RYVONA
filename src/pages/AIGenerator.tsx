import React, { useState , useEffect } from 'react';
import { PromptInput } from '../components/PromptInput';
import { ImageDisplay } from '../components/ImageDisplay';
import { ImageGallery } from '../components/ImageGallery';
import { ImageSettings } from '../components/ImageSettings';
import { PromptEnhancer } from '../components/PromptEnhancer';
import { generateImage } from '../services/imageGeneration';
import { GeneratedImage } from '../types/image';
import Navbar from '../components/Navbar';
import { apiService } from '../services/api';
import { CustomSelect } from '../components/CustomSelect';

interface DesignState {
  product: string;
  color: string;
  view: string;
  size: string;
}

export const AIGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedProduct, setSelectedProduct] = useState('select product');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [products, setProducts] = useState<string[]>([]);
  const [_loadingProducts, setLoadingProducts] = useState(true);


  const [settings, setSettings] = useState({
    aspectRatio: '1:1',
    quality: 'high',
    style: 'photorealistic',
    steps: 2,
  });

  useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await apiService.getInStockTemplates();
          
          if (response.success && response.data) {
            const productNames = response.data.map(template => template.name);
            setProducts([...new Set(productNames)]); // Remove duplicates
            
            // Set the first product as default if available
            if (productNames.length > 0) {
              setDesignState(prev => ({
                ...prev,
                product: productNames[0]
              }));
            }
          } else {
            throw new Error(response.message || 'Failed to load products');
          }
        } catch (error) {
          console.error('Error fetching products:', error);
          // Fallback to default products
          setProducts(['T-Shirt', 'Hoodie', 'Tank Top', 'Long Sleeve']);
          setDesignState(prev => ({
            ...prev,
            product: 'T-Shirt'
          }));
        } finally {
          setLoadingProducts(false);
        }
      };
      
      fetchProducts();
    }, []);

  const [_designState, setDesignState] = useState<DesignState>({
      product: '',
      color: 'black',
      view: 'front',
      size: 'M'
    });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'gray', 'pink'];


  const handleGenerate = async (prompt: string) => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentPrompt(prompt);
    setSaveSuccess(false);

    try {
      console.log('Starting image generation with prompt:', prompt);
      console.log('Settings:', settings);
      
      const imageData = await generateImage(prompt, settings);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        imageUrl: imageData.imageUrl,
        createdAt: new Date(),
        settings: { ...settings },
      };

      setCurrentImage(newImage);
      setImageHistory(prev => [newImage, ...prev.slice(0, 19)]);
      console.log('Image generation successful');
    } catch (err) {
      console.error('Image generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while generating the image';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!currentImage) {
      setError('No image to save');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Convert the blob URL to base64
      const response = await fetch(currentImage.imageUrl);
      const blob = await response.blob();
      
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result?.toString() || '';
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const designData = {
        image: base64data,
        product: selectedProduct,
        color: selectedColor,
        size: selectedSize,
        view: 'front'
      };

      const saveResponse = await fetch('/api/save-design.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
        credentials: 'include'
      });

      const result = await saveResponse.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to save design');
      }

      console.log('Design saved successfully:', result);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving design:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while saving the design';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectFromHistory = (image: GeneratedImage) => {
    setCurrentImage(image);
    setCurrentPrompt(image.prompt);
    if (image.settings) {
      setSettings(image.settings);
    }
    setError(null);
  };

  const handleEnhancePrompt = (enhancedPrompt: string) => {
    setCurrentPrompt(enhancedPrompt);
    handleGenerate(enhancedPrompt);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden z-[-1]">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      </div>
      
      {/* Fixed Navbar at top */}
      <div className="relative z-20">
        <Navbar />
      </div>
      
      {/* Full screen main content */}
      <main className="relative z-10 flex-1 overflow-y-auto ai-generator-scrollbar">
        <div className="w-full h-full px-4 py-4">
          <div className="w-full h-full space-y-4">
            {/* Compact header */}
            <div className="relative w-full overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-purple-600/20 animate-pulse"></div>
              <div className="relative bg-black/30 backdrop-blur-sm p-3">
                <h1 className="text-xl md:text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                  Ryvona - Tunisian Image Generator
                </h1>
                <p className="text-center text-purple-200 text-xs">
                  🇹🇳 Revolutionary AI-Powered Design Studio - Where Tunisian Creativity Meets Cutting-Edge Technology
                </p>
              </div>
            </div>

            <PromptInput 
              onGenerate={handleGenerate} 
              isGenerating={isGenerating}
              initialPrompt={currentPrompt}
            />
            
            <div className="flex items-center justify-center">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all duration-300 text-xs ${
                  showAdvanced 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 hover:text-white'
                }`}
              >
                {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                <span className="ml-1">{showAdvanced ? '↑' : '↓'}</span>
              </button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
                <ImageSettings 
                  settings={settings}
                  onSettingsChange={setSettings}
                  isGenerating={isGenerating}
                />
                <PromptEnhancer 
                  onEnhancePrompt={handleEnhancePrompt}
                  currentPrompt={currentPrompt}
                  isGenerating={isGenerating}
                />
              </div>
            )}
            
            {error && (
              <div className="relative w-full bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-red-300 overflow-hidden">
                <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium flex items-center text-xs">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Generation Failed
                      </p>
                      <p className="text-xs mt-1">{error}</p>
                    </div>
                    <button
                      onClick={clearError}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 hover:bg-red-500/20 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-red-400">
                    <p><strong>Troubleshooting tips:</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>Try a simpler, more descriptive prompt</li>
                      <li>Check your internet connection</li>
                      <li>Wait a moment and try again</li>
                      <li>Try reducing the image quality or changing the aspect ratio</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 relative z-10">
  <ImageDisplay 
    image={currentImage} 
    isGenerating={isGenerating} 
  />
  {currentImage && (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <CustomSelect
          options={products}
          value={selectedProduct}
          onChange={setSelectedProduct}
          label="Product"
        />
        <div>
          <label className="block text-xs font-medium text-purple-200 mb-1">Color</label>
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {colors.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-purple-200 mb-1">Size</label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            {sizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={handleSaveDesign}
          disabled={isSaving}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            isSaving
              ? 'bg-purple-800 text-purple-300 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Design'}
        </button>
              </div>
              
              {saveSuccess && (
                <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-md text-center text-green-300 text-sm">
                  Design saved successfully!
                </div>
              )}
            </div>
          )}
        </div>

            {imageHistory.length > 0 && (
              <div className="w-full p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10 relative z-0">
                <h2 className="text-base font-semibold text-white mb-2 flex items-center z-0">
                  <svg className="w-3 h-3 mr-1 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Generation History
                </h2>
                <ImageGallery 
                  images={imageHistory} 
                  onSelectImage={handleSelectFromHistory}
                  currentImageId={currentImage?.id}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIGenerator;