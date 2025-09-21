import React, { useRef } from 'react';
import { Image } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelect, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`p-2 rounded-lg transition-colors ${
          disabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
        }`}
        title="Upload image"
      >
        <Image className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ImageUpload; 