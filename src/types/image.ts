export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: Date;
  settings?: {
    aspectRatio: string;
    quality: string;
    style: string;
    steps: number;
  };
}

export interface ImageGenerationResponse {
  imageUrl: string;
}

export interface ImageSettings {
  aspectRatio: string;
  quality: string;
  style: string;
  steps: number;
} 