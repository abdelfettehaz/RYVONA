import React from 'react';
import { GeneratedImage } from '../types/image';

interface ImageGalleryProps {
  images: GeneratedImage[];
  onSelectImage: (image: GeneratedImage) => void;
  currentImageId?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ 
  images, 
  onSelectImage, 
  currentImageId 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white">Recent Generations</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => onSelectImage(image)}
            className={`group relative aspect-square rounded-lg overflow-hidden transition-all duration-300 ${
              currentImageId === image.id 
                ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-900' 
                : 'hover:scale-105 hover:shadow-xl'
            }`}
          >
            <img
              src={image.imageUrl}
              alt={image.prompt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <p className="text-white text-xs text-center line-clamp-2">
                  {image.prompt}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 