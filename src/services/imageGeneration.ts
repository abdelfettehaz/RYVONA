import Together from "together-ai";
import { ImageGenerationResponse, ImageSettings } from '../types/image';

// Initialize Together AI client with API key
const together = new Together({
  apiKey: import.meta.env.VITE_TOGETHER_API_KEY || "27c6b0e8ec18c2a66906ca0688c3879b4b6b72bb144454e01f666988b35c87ef"
});

const getAspectRatioDimensions = (aspectRatio: string) => {
  const ratios: { [key: string]: { width: number; height: number } } = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1344, height: 768 },
    '9:16': { width: 768, height: 1344 },
    '4:3': { width: 1152, height: 896 },
    '3:2': { width: 1216, height: 832 },
  };
  return ratios[aspectRatio] || ratios['1:1'];
};

const enhancePromptWithStyle = (prompt: string, style: string): string => {
  const styleEnhancements: { [key: string]: string } = {
    'photorealistic': 'photorealistic, highly detailed, professional photography, 8K resolution, sharp focus',
    'artistic': 'artistic masterpiece, creative composition, vibrant colors, award winning art',
    'cinematic': 'cinematic lighting, dramatic composition, movie still, professional cinematography',
    'anime': 'anime style, manga art, Japanese animation, detailed character design',
    'digital-art': 'digital art, concept art, detailed illustration, professional digital painting',
    'oil-painting': 'oil painting style, classical art, painterly texture, fine art',
    'watercolor': 'watercolor painting, soft colors, artistic brush strokes, traditional art',
    'sketch': 'pencil sketch, detailed drawing, artistic line work, traditional sketching',
  };

  const enhancement = styleEnhancements[style] || '';
  return enhancement ? `${prompt}, ${enhancement}` : prompt;
};

export const generateImage = async (
  prompt: string, 
  settings: ImageSettings
): Promise<ImageGenerationResponse> => {
  try {
    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Please provide a valid prompt');
    }

    console.log('Generating image with Together AI Flux.1 Schnell:', prompt);
    
    const dimensions = getAspectRatioDimensions(settings.aspectRatio);
    const enhancedPrompt = enhancePromptWithStyle(prompt, settings.style);
    
    // Add quality enhancements based on settings
    let finalPrompt = enhancedPrompt;
    if (settings.quality === 'high') {
      finalPrompt += ', high quality, detailed, professional';
    } else if (settings.quality === 'ultra') {
      finalPrompt += ', ultra high quality, masterpiece, best quality, extremely detailed, 8K resolution';
    }

    // Ensure steps are within valid range for Flux.1 Schnell
    const validSteps = Math.max(1, Math.min(settings.steps, 4)); // Flux.1 Schnell typically uses 1-4 steps

    console.log('Final prompt:', finalPrompt);
    console.log('Dimensions:', dimensions);
    console.log('Steps:', validSteps);

    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: finalPrompt,
      width: dimensions.width,
      height: dimensions.height,
      steps: validSteps,
      n: 1,
      response_format: "base64"
    });

    console.log('Together AI response received:', response);

    // Check if response has data
    if (!response || !response.data || response.data.length === 0) {
      console.error('No data in response:', response);
      throw new Error('No image data received from Together AI. Please try again.');
    }

    const imageData = response.data[0];
    if (!imageData || !('b64_json' in imageData)) {
      console.error('No base64 data in response:', imageData);
      throw new Error('Invalid image data received. Please try again.');
    }

    // Convert base64 to blob URL
    const base64Data = (imageData as any).b64_json;
    
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);

      console.log('Successfully generated image');
      return { imageUrl };
    } catch (decodeError) {
      console.error('Error decoding base64 image:', decodeError);
      throw new Error('Failed to process generated image. Please try again.');
    }

  } catch (error) {
    console.error('Error generating image:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('API key issue. Please check your Together AI configuration.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again.');
      } else if (error.message.includes('prompt')) {
        throw new Error('Invalid prompt. Please try a different description.');
      } else {
        throw new Error(`Generation failed: ${error.message}`);
      }
    }
    
    throw new Error('Failed to generate image. Please try again with a different prompt.');
  }
}; 