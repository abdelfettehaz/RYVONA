import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  FaTshirt, FaPalette, FaEye, FaFont, FaImage, FaSave, 
  FaUndo, FaRedo, FaTrash, FaCloudUploadAlt,
  FaBold, FaItalic, FaUnderline, FaAlignLeft,
  FaAlignCenter, FaAlignRight, FaExpand, FaCompress, FaMagic,
  FaRobot // Added AI icon
} from 'react-icons/fa';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { ChromePicker } from 'react-color';
import { apiService } from '../services/api';

interface DesignState {
  product: string;
  color: string;
  view: string;
  size: string;
}

interface TextOverlay {
  id: string;
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textAlign: string;
  rotation: number;
  selected: boolean;
}

interface OverlayImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  rotation: number;
  selected: boolean;
}

const DesignStudio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  
  // Check authentication
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  const [designState, setDesignState] = useState<DesignState>({
    product: '',
    color: 'black',
    view: 'front',
    size: 'M'
  });
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [overlayImages, setOverlayImages] = useState<OverlayImage[]>([]);
  const [activeText, setActiveText] = useState<TextOverlay | null>(null);
  const [newText, setNewText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [zoom, setZoom] = useState(100);
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeDir, setResizeDir] = useState<string>('');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [rotatingId, setRotatingId] = useState<string | null>(null);
  const containerSize = { width: 800, height: 1000 };
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [products, setProducts] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isLowResolution, setIsLowResolution] = useState(false);

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

  // Detect low resolution devices
  useEffect(() => {
    const checkResolution = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLowRes = width <= 480 || height <= 480 || (width * height) < 200000; // Less than 200k pixels
      setIsLowResolution(isLowRes);
    };

    checkResolution();
    window.addEventListener('resize', checkResolution);
    
    return () => window.removeEventListener('resize', checkResolution);
  }, []);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Helper function to get resize handle styles
  const getResizeHandleStyle = (position: string) => {
    // Make handles larger for all devices, especially mobile
    const baseSize = isLowResolution ? 35 : 20; // Increased from 10/25 to 20/35
    const offset = isLowResolution ? -17.5 : -10; // Adjusted for new sizes
    
    const positions: Record<string, any> = {
      'se': { right: offset, bottom: offset, cursor: 'nwse-resize' },
      'sw': { left: offset, bottom: offset, cursor: 'nesw-resize' },
      'ne': { right: offset, top: offset, cursor: 'nesw-resize' },
      'nw': { left: offset, top: offset, cursor: 'nwse-resize' },
      'n': { left: '50%', top: offset, marginLeft: -baseSize/2, cursor: 'ns-resize' },
      's': { left: '50%', bottom: offset, marginLeft: -baseSize/2, cursor: 'ns-resize' },
      'w': { left: offset, top: '50%', marginTop: -baseSize/2, cursor: 'ew-resize' },
      'e': { right: offset, top: '50%', marginTop: -baseSize/2, cursor: 'ew-resize' }
    };

    return {
      position: 'absolute' as const,
      width: baseSize,
      height: baseSize,
      backgroundColor: '#3b82f6',
      zIndex: 101,
      border: '2px solid #ffffff',
      boxShadow: '0 0 4px rgba(0, 0, 0, 0.5)',
      borderRadius: '50%', // Make handles circular for better touch targets
      ...positions[position]
    };
  };

  // Helper to get product image path
  const BASE_URL = import.meta.env.BASE_URL || '/';
  function getProductImage(product: string, color: string, view: string): string {
    if (
      productImages[product] &&
      productImages[product][color] &&
      productImages[product][color][view]
    ) {
      return productImages[product][color][view];
    }
    return `${BASE_URL}images/black t-shirts/black-front.jpg`;
  }

  const productImages: Record<string, any> = {
    'V-neck t-shirt': {
      'black': {
        'front': `${BASE_URL}images/black t-shirts/black-front.jpg`,
        'back': `${BASE_URL}images/black t-shirts/behind.jpg`,
        'left': `${BASE_URL}images/black t-shirts/left.jpg`,
        'right': `${BASE_URL}images/black t-shirts/right.jpg`
      },
      'white': {
        'front': `${BASE_URL}images/white t-shirts/front.jpg`,
        'back': `${BASE_URL}images/white t-shirts/back.jpg`,
        'left': `${BASE_URL}images/white t-shirts/left.jpg`,
        'right': `${BASE_URL}images/white t-shirts/right.jpg`
      },
      'red': {
        'front': `${BASE_URL}images/red t-shirts/front.jpg`,
        'back': `${BASE_URL}images/red t-shirts/back.jpg`,
        'left': `${BASE_URL}images/red t-shirts/left.jpg`,
        'right': `${BASE_URL}images/red t-shirts/right.jpg`
      },
      'navy': {
        'front': `${BASE_URL}images/navy t-shirts/front.jpg`,
        'back': `${BASE_URL}images/navy t-shirts/back.jpg`,
        'left': `${BASE_URL}images/navy t-shirts/left.jpg`,
        'right': `${BASE_URL}images/navy t-shirts/right.jpg`
      }
    },
    'Hoodie': {
      'black': {
        'front': `${BASE_URL}images/hoodies/black/front-hq.jpg`,
        'back': `${BASE_URL}images/hoodies/black/back-hq.jpg`
      },
      'gray': {
        'front': `${BASE_URL}images/hoodies/gray/front-hq.jpg`,
        'back': `${BASE_URL}images/hoodies/gray/back-hq.jpg`
      }
    }
  };

  const colors = [
    { name: 'black', hex: '#000000' },
    { name: 'white', hex: '#ffffff' },
    { name: 'red', hex: '#ff0000' },
    { name: 'navy', hex: '#001f3f' },
    { name: 'gray', hex: '#808080' },
    { name: 'royal blue', hex: '#4169e1' },
    { name: 'forest green', hex: '#228b22' }
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
  const views = ['front', 'back', 'left', 'right'];
  const FONT_FAMILIES = ['Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New', 'Impact', 'Comic Sans MS', 'Georgia', 'Palatino'];

  const addText = () => {
    if (!newText.trim()) return;
    
    const id = generateId();
    const newOverlay: TextOverlay = {
      id,
      content: newText,
      x: containerSize.width / 2,
      y: containerSize.height / 2,
      width: 200,
      height: 50,
      fontSize,
      color: textColor,
      fontFamily,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      rotation: 0,
      selected: true
    };
    
    setTextOverlays([...textOverlays, newOverlay]);
    setActiveText(newOverlay);
    setNewText('');
  };

  const updateTextStyle = (id: string, property: string, value: any) => {
    setTextOverlays(textOverlays.map(text => 
      text.id === id ? { ...text, [property]: value } : text
    ));
    
    if (activeText?.id === id) {
      setActiveText({ ...activeText, [property]: value });
    }
  };

  useEffect(() => {
    const getClientPos = (e: MouseEvent | TouchEvent) => {
      if ('touches' in e) {
        return {
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY
        };
      }
      return {
        clientX: e.clientX,
        clientY: e.clientY
      };
    };

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!overlayContainerRef.current) return;
      
      const { clientX, clientY } = getClientPos(e);
      const rect = overlayContainerRef.current.getBoundingClientRect();
      const scaleX = containerSize.width / rect.width;
      const scaleY = containerSize.height / rect.height;
      
      if (draggingId) {
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        if (dragOffset) {
          x -= dragOffset.x;
          y -= dragOffset.y;
        }
        
        setOverlayImages(prev => prev.map(img => 
          img.id === draggingId ? { ...img, x, y } : img
        ));
        
        setTextOverlays(prev => prev.map(text => 
          text.id === draggingId ? { ...text, x, y } : text
        ));
      }
      
      if (resizingId && resizeDir) {
        const mouseX = (clientX - rect.left) * scaleX;
        const mouseY = (clientY - rect.top) * scaleY;
        
        if (rotatingId) {
          const overlay = overlayImages.find(img => img.id === rotatingId) || 
                         textOverlays.find(text => text.id === rotatingId);
          
          if (overlay) {
            const centerX = overlay.x + (overlay.width || 200) / 2;
            const centerY = overlay.y + (overlay.height || 50) / 2;
            
            const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
            const rotation = angle + 90;
            
            if (overlayImages.find(img => img.id === rotatingId)) {
              setOverlayImages(prev => prev.map(img => 
                img.id === rotatingId ? { ...img, rotation } : img
              ));
            } else {
              setTextOverlays(prev => prev.map(text => 
                text.id === rotatingId ? { ...text, rotation } : text
              ));
            }
          }
        } else {
          setOverlayImages(prev => prev.map(img => {
            if (img.id !== resizingId) return img;
            
            let newWidth = img.width;
            let newHeight = img.height;
            let newX = img.x;
            let newY = img.y;
            
            switch (resizeDir) {
              case 'se':
                newWidth = Math.max(20, mouseX - img.x);
                newHeight = Math.max(20, mouseY - img.y);
                break;
              case 'sw':
                newWidth = Math.max(20, img.x + img.width - mouseX);
                newHeight = Math.max(20, mouseY - img.y);
                newX = mouseX;
                break;
              case 'ne':
                newWidth = Math.max(20, mouseX - img.x);
                newHeight = Math.max(20, img.y + img.height - mouseY);
                newY = mouseY;
                break;
              case 'nw':
                newWidth = Math.max(20, img.x + img.width - mouseX);
                newHeight = Math.max(20, img.y + img.height - mouseY);
                newX = mouseX;
                newY = mouseY;
                break;
              case 'e':
                newWidth = Math.max(20, mouseX - img.x);
                break;
              case 'w':
                newWidth = Math.max(20, img.x + img.width - mouseX);
                newX = mouseX;
                break;
              case 's':
                newHeight = Math.max(20, mouseY - img.y);
                break;
              case 'n':
                newHeight = Math.max(20, img.y + img.height - mouseY);
                newY = mouseY;
                break;
            }
            
            return { ...img, x: newX, y: newY, width: newWidth, height: newHeight };
          }));
          
          setTextOverlays(prev => prev.map(text => {
            if (text.id !== resizingId) return text;
            let newWidth = text.width || 200;
            let newHeight = text.height || 50;
            let newX = text.x;
            let newY = text.y;
            
            switch (resizeDir) {
              case 'se':
                newWidth = Math.max(40, Math.min(1000, mouseX - text.x));
                newHeight = Math.max(40, Math.min(600, mouseY - text.y));
                
                // Maintain aspect ratio for better text scaling
                const aspectRatio = (text.width || 200) / (text.height || 50);
                if (Math.abs(aspectRatio - (newWidth / newHeight)) > 0.5) {
                  // If resizing significantly changes aspect ratio, adjust height to maintain it
                  newHeight = newWidth / aspectRatio;
                }
                break;
              case 'sw':
                newWidth = Math.max(40, Math.min(1000, text.x + (text.width || 200) - mouseX));
                newHeight = Math.max(40, Math.min(600, mouseY - text.y));
                
                // Maintain aspect ratio
                const aspectRatioSW = (text.width || 200) / (text.height || 50);
                if (Math.abs(aspectRatioSW - (newWidth / newHeight)) > 0.5) {
                  newHeight = newWidth / aspectRatioSW;
                }
                newX = mouseX;
                break;
              case 'ne':
                newWidth = Math.max(40, Math.min(1000, mouseX - text.x));
                newHeight = Math.max(40, Math.min(600, text.y + (text.height || 50) - mouseY));
                
                // Maintain aspect ratio
                const aspectRatioNE = (text.width || 200) / (text.height || 50);
                if (Math.abs(aspectRatioNE - (newWidth / newHeight)) > 0.5) {
                  newHeight = newWidth / aspectRatioNE;
                }
                newY = mouseY;
                break;
              case 'nw':
                newWidth = Math.max(40, Math.min(1000, text.x + (text.width || 200) - mouseX));
                newHeight = Math.max(40, Math.min(600, text.y + (text.height || 50) - mouseY));
                
                // Maintain aspect ratio
                const aspectRatioNW = (text.width || 200) / (text.height || 50);
                if (Math.abs(aspectRatioNW - (newWidth / newHeight)) > 0.5) {
                  newHeight = newWidth / aspectRatioNW;
                }
                newX = mouseX;
                newY = mouseY;
                break;
              case 'e':
                newWidth = Math.max(40, Math.min(1000, mouseX - text.x));
                break;
              case 'w':
                newWidth = Math.max(40, Math.min(1000, text.x + (text.width || 200) - mouseX));
                newX = mouseX;
                break;
              case 's':
                newHeight = Math.max(40, Math.min(600, mouseY - text.y));
                break;
              case 'n':
                newHeight = Math.max(40, Math.min(600, text.y + (text.height || 50) - mouseY));
                newY = mouseY;
                break;
            }
            
            const baseFontSize = text.fontSize || 24;
            const baseHeight = text.height || 50;
            // Scale font size proportionally to height change
            const newFontSize = Math.max(8, Math.min(200, Math.round(baseFontSize * (newHeight / baseHeight))));
            
            return { ...text, x: newX, y: newY, width: newWidth, height: newHeight, fontSize: newFontSize };
          }));
        }
      }
    };

    const handleGlobalEnd = () => {
      setDraggingId(null);
      setResizingId(null);
      setResizeDir('');
      setRotatingId(null);
      setDragOffset(null);
    };

    if (draggingId || resizingId || rotatingId) {
      document.addEventListener('mousemove', handleGlobalMove);
      document.addEventListener('mouseup', handleGlobalEnd);
      document.addEventListener('touchmove', handleGlobalMove, { passive: false });
      document.addEventListener('touchend', handleGlobalEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [draggingId, resizingId, resizeDir, rotatingId, containerSize.width, containerSize.height]);

  // useEffect for preview rendering - matches save function exactly
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = containerSize.width;
    canvas.height = containerSize.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const baseImage = new Image();
    const imagePath = getProductImage(designState.product, designState.color, designState.view);
    baseImage.onload = () => {
      // Draw base product image
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      
      // Draw all image overlays with EXACT positioning (same as save function)
      overlayImages.forEach(img => {
        const image = new Image();
        image.onload = () => {
          ctx.save();
          ctx.globalAlpha = img.opacity;
          
          // Calculate the exact center point for rotation
          const centerX = img.x + img.width / 2;
          const centerY = img.y + img.height / 2;
          
          // Move to the center point where we want to rotate
          ctx.translate(centerX, centerY);
          
          // Rotate around the center
          ctx.rotate((img.rotation * Math.PI) / 180);
          
          // Draw the image with EXACT positioning and sizing
          ctx.drawImage(
            image,
            -img.width / 2,  // x offset to center
            -img.height / 2, // y offset to center
            img.width,       // EXACT width
            img.height       // EXACT height
          );
          
          ctx.restore();
        };
        image.src = img.src;
      });
      
      // Draw all text overlays with EXACT positioning (same as save function)
      textOverlays.forEach(text => {
        ctx.save();
        
        // Set text styles EXACTLY as they appear
        ctx.font = `${text.fontWeight} ${text.fontStyle} ${text.fontSize}px ${text.fontFamily}`;
        ctx.fillStyle = text.color;
        ctx.textAlign = text.textAlign as CanvasTextAlign;
        ctx.textBaseline = 'middle';
        
        // Calculate EXACT text position center
        const textWidth = text.width || 200;
        const textHeight = text.height || 50;
        const centerX = text.x + textWidth / 2;
        const centerY = text.y + textHeight / 2;
        
        // Move to the EXACT center of the text position
        ctx.translate(centerX, centerY);
        
        // Rotate around the center with EXACT rotation
        ctx.rotate((text.rotation * Math.PI) / 180);
        
        // Draw the text with EXACT positioning and formatting
        const lines = text.content.split('\n');
        const lineHeight = text.fontSize * 1.2;
        const startY = -(lines.length - 1) * lineHeight / 2;
        
        // Apply text decoration
        if (text.textDecoration === 'underline') {
          ctx.strokeStyle = text.color;
          ctx.lineWidth = Math.max(1, text.fontSize / 20);
        }
        
        lines.forEach((line, i) => {
          const y = startY + i * lineHeight;
          
          // Draw the text
          ctx.fillText(
            line,
            0,
            y,
            textWidth // maxWidth for text wrapping
          );
          
          // Draw underline if needed
          if (text.textDecoration === 'underline') {
            const textWidth_actual = ctx.measureText(line).width;
            const underlineY = y + text.fontSize / 4;
            ctx.beginPath();
            ctx.moveTo(-textWidth_actual / 2, underlineY);
            ctx.lineTo(textWidth_actual / 2, underlineY);
            ctx.stroke();
          }
        });
        
        ctx.restore();
      });
    };
    baseImage.src = imagePath;
  }, [designState, textOverlays, overlayImages]);

  const handleSaveDesign = async () => {
    if (!canvasRef.current) return;
    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = containerSize.width;
      tempCanvas.height = containerSize.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      // Draw base product image
      const baseImage = new Image();
      const imagePath = getProductImage(designState.product, designState.color, designState.view);
      
      await new Promise<void>((resolve) => {
        baseImage.onload = () => {
          tempCtx.drawImage(baseImage, 0, 0, tempCanvas.width, tempCanvas.height);
          resolve();
        };
        baseImage.src = imagePath;
      });

      // Draw all image overlays with EXACT positioning and sizing
      for (const img of overlayImages) {
        await new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = () => {
            tempCtx.save();
            tempCtx.globalAlpha = img.opacity;
            
            // Calculate the exact center point for rotation
            const centerX = img.x + img.width / 2;
            const centerY = img.y + img.height / 2;
            
            // Move to the center point where we want to rotate
            tempCtx.translate(centerX, centerY);
            
            // Rotate around the center
            tempCtx.rotate((img.rotation * Math.PI) / 180);
            
            // Draw the image with EXACT positioning and sizing
            tempCtx.drawImage(
              image,
              -img.width / 2,  // x offset to center
              -img.height / 2, // y offset to center
              img.width,       // EXACT width
              img.height       // EXACT height
            );
            
            tempCtx.restore();
            resolve();
          };
          image.src = img.src;
        });
      }

      // Draw all text overlays with EXACT positioning, sizing, and formatting
      textOverlays.forEach(text => {
        tempCtx.save();
        
        // Set text styles EXACTLY as they appear
        tempCtx.font = `${text.fontWeight} ${text.fontStyle} ${text.fontSize}px ${text.fontFamily}`;
        tempCtx.fillStyle = text.color;
        tempCtx.textAlign = text.textAlign as CanvasTextAlign;
        tempCtx.textBaseline = 'middle';
        
        // Calculate EXACT text position center
        const textWidth = text.width || 200;
        const textHeight = text.height || 50;
        const centerX = text.x + textWidth / 2;
        const centerY = text.y + textHeight / 2;
        
        // Move to the EXACT center of the text position
        tempCtx.translate(centerX, centerY);
        
        // Rotate around the center with EXACT rotation
        tempCtx.rotate((text.rotation * Math.PI) / 180);
        
        // Draw the text with EXACT positioning and formatting
        const lines = text.content.split('\n');
        const lineHeight = text.fontSize * 1.2;
        const startY = -(lines.length - 1) * lineHeight / 2;
        
        // Apply text decoration
        if (text.textDecoration === 'underline') {
          tempCtx.strokeStyle = text.color;
          tempCtx.lineWidth = Math.max(1, text.fontSize / 20);
        }
        
        lines.forEach((line, i) => {
          const y = startY + i * lineHeight;
          
          // Draw the text
          tempCtx.fillText(
            line,
            0,
            y,
            textWidth // maxWidth for text wrapping
          );
          
          // Draw underline if needed
          if (text.textDecoration === 'underline') {
            const textWidth_actual = tempCtx.measureText(line).width;
            const underlineY = y + text.fontSize / 4;
            tempCtx.beginPath();
            tempCtx.moveTo(-textWidth_actual / 2, underlineY);
            tempCtx.lineTo(textWidth_actual / 2, underlineY);
            tempCtx.stroke();
          }
        });
        
        tempCtx.restore();
      });

      // Convert to high-quality data URL
      const imageData = tempCanvas.toDataURL('image/png', 1.0);
      
      // Create payload with EXACT overlay data
      const payload = {
        image: imageData,
        product: designState.product,
        color: designState.color,
        view: designState.view,
        size: designState.size,
        overlays: {
          images: overlayImages.map(img => ({
            src: img.src,
            x: img.x,           // EXACT x position
            y: img.y,           // EXACT y position
            width: img.width,   // EXACT width
            height: img.height, // EXACT height
            rotation: img.rotation, // EXACT rotation
            opacity: img.opacity    // EXACT opacity
          })),
          texts: textOverlays.map(text => ({
            content: text.content,
            x: text.x,              // EXACT x position
            y: text.y,              // EXACT y position
            width: text.width,      // EXACT width
            height: text.height,    // EXACT height
            fontSize: text.fontSize, // EXACT font size
            color: text.color,
            fontFamily: text.fontFamily,
            fontWeight: text.fontWeight,
            fontStyle: text.fontStyle,
            textDecoration: text.textDecoration,
            textAlign: text.textAlign,
            rotation: text.rotation // EXACT rotation
          }))
        }
      };

      // Send to server
      const response = await apiService.saveDesign(payload);

      if (response.success) {
        alert('Design saved successfully with exact positioning!');
        navigate('/my-designs');
      } else {
        alert('Failed to save design: ' + (response.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving design:', err);
      alert('Error saving design: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Drag and drop handlers for image upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    handleMultipleImageUpload(e.dataTransfer.files);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleMultipleImageUpload(files);
    }
    if (event.target) event.target.value = '';
  };

  const handleMultipleImageUpload = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Please select valid image files.');
      return;
    }
    let loadedCount = 0;
    const newImages: OverlayImage[] = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const id = generateId();
        newImages.push({
          id,
          src: e.target?.result as string,
          x: containerSize.width / 2 - 100 + (loadedCount * 30),
          y: containerSize.height / 2 - 100 + (loadedCount * 30),
          width: 200,
          height: 200,
          opacity: 1,
          rotation: 0,
          selected: false
        });
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setOverlayImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleOverlayContainerClick = () => {
    setOverlayImages(prev => prev.map(img => ({ ...img, selected: false })));
    setTextOverlays(prev => prev.map(text => ({ ...text, selected: false })));
    setActiveText(null);
  };

  const handleOverlayMouseMove = () => {
    // Handled by global mouse events
  };

  const handleOverlayMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
  };

  const getClientPos = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY
      };
    }
    return {
      clientX: e.clientX,
      clientY: e.clientY
    };
  };

  const handleOverlayStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
    setResizingId(null);

    const imageOverlay = overlayImages.find(img => img.id === id);
    const textOverlay = textOverlays.find(text => text.id === id);
    let overlay = imageOverlay || textOverlay;
    if (overlay) {
      const rect = overlayContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const { clientX, clientY } = getClientPos(e);
        const mouseX = (clientX - rect.left) * (containerSize.width / rect.width);
        const mouseY = (clientY - rect.top) * (containerSize.height / rect.height);
        setDragOffset({ x: mouseX - overlay.x, y: mouseY - overlay.y });
      }
    }

    if (imageOverlay) {
      setOverlayImages(prev => prev.map(img => ({ ...img, selected: img.id === id })));
      setTextOverlays(prev => prev.map(text => ({ ...text, selected: false })));
      setActiveText(null);
    } else if (textOverlay) {
      setTextOverlays(prev => prev.map(text => ({ ...text, selected: text.id === id })));
      setOverlayImages(prev => prev.map(img => ({ ...img, selected: false })));
      setActiveText(textOverlay);
    }
  };

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent, id: string, direction: string) => {
    e.stopPropagation();
    setResizingId(id);
    setResizeDir(direction);
    setDraggingId(null);
  };

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.stopPropagation();
    setRotatingId(id);
    setResizingId(null);
    setDraggingId(null);
  };

  const renderImageOverlays = () => (
    <div
      ref={overlayContainerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: containerSize.width,
        height: containerSize.height,
        pointerEvents: 'auto',
        zIndex: 10
      }}
      onClick={handleOverlayContainerClick}
      onMouseMove={handleOverlayMouseMove}
      onMouseUp={handleOverlayMouseUp}
      onMouseLeave={handleOverlayMouseUp}
    >
      {overlayImages.map(img => {
        const isActive = img.selected || draggingId === img.id || resizingId === img.id;
        return (
          <div
            key={img.id}
            style={{
              position: 'absolute',
              left: img.x,
              top: img.y,
              width: img.width,
              height: img.height,
              opacity: img.opacity,
              transform: `rotate(${img.rotation}deg)` + (isActive ? ' scale(1.02)' : ''),
              border: isActive ? '3px solid #3b82f6' : '2px solid #ccc',
              boxSizing: 'border-box',
              cursor: draggingId === img.id ? 'grabbing' : 'grab',
              zIndex: isActive ? 100 : 1,
              background: 'transparent',
              userSelect: 'none',
            }}
            onMouseDown={e => handleOverlayStart(e, img.id)}
            onTouchStart={e => handleOverlayStart(e, img.id)}
            onClick={e => {
              e.stopPropagation();
              setOverlayImages(prev => prev.map(image => ({ ...image, selected: image.id === img.id })));
              setTextOverlays(prev => prev.map(text => ({ ...text, selected: false })));
              setActiveText(null);
            }}
          >
            {isActive && (
              <>
                {/* Resize handles */}
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('se')}
                  onMouseDown={e => handleResizeStart(e, img.id, 'se')}
                  onTouchStart={e => handleResizeStart(e, img.id, 'se')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('sw')}
                  onMouseDown={e => handleResizeStart(e, img.id, 'sw')}
                  onTouchStart={e => handleResizeStart(e, img.id, 'sw')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('ne')}
                  onMouseDown={e => handleResizeStart(e, img.id, 'ne')}
                  onTouchStart={e => handleResizeStart(e, img.id, 'ne')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('nw')}
                  onMouseDown={e => handleResizeStart(e, img.id, 'nw')}
                  onTouchStart={e => handleResizeStart(e, img.id, 'nw')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('n')}
                  onMouseDown={e => handleResizeStart(e, img.id, 'n')}
                  onTouchStart={e => handleResizeStart(e, img.id, 'n')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('s')}
                  onMouseDown={e => handleResizeStart(e, img.id, 's')}
                  onTouchStart={e => handleResizeStart(e, img.id, 's')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('w')}
                  onMouseDown={e => handleResizeStart(e, img.id, 'w')}
                  onTouchStart={e => handleResizeStart(e, img.id, 'w')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('e')}
                  onMouseDown={e => handleResizeStart(e, img.id, 'e')}
                  onTouchStart={e => handleResizeStart(e, img.id, 'e')}
                />
                
                {/* Rotate handle */}
                <div
                  className={`rotate-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={{
                    position: 'absolute',
                    width: isLowResolution ? 35 : 20,
                    height: isLowResolution ? 35 : 20,
                    backgroundColor: '#3b82f6',
                    left: '50%',
                    top: isLowResolution ? -40 : -30,
                    marginLeft: isLowResolution ? -17.5 : -10,
                    borderRadius: '50%',
                    cursor: 'grab',
                    zIndex: 101,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isLowResolution ? 16 : 12,
                    border: isLowResolution ? '2px solid #ffffff' : 'none',
                    boxShadow: isLowResolution ? '0 0 4px rgba(0, 0, 0, 0.3)' : 'none'
                  }}
                  onMouseDown={e => handleRotateStart(e, img.id)}
                  onTouchStart={e => handleRotateStart(e, img.id)}
                >
                  ↻
                </div>
                
                {/* Delete button */}
                <button
                  style={{
                    position: 'absolute',
                    right: -15,
                    top: -15,
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: 25,
                    height: 25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 101
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlayImages(prev => prev.filter(image => image.id !== img.id));
                  }}
                >
                  ×
                </button>
              </>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderTextOverlays = () => (
    <>
      {textOverlays.map(t => {
        const isActive = t.selected || draggingId === t.id || resizingId === t.id;
        return (
          <div
            key={t.id}
            style={{
              position: 'absolute',
              left: t.x,
              top: t.y,
              width: t.width || 200,
              height: t.height || 50,
              color: t.color,
              fontFamily: t.fontFamily,
              fontSize: t.fontSize,
              fontWeight: t.fontWeight,
              fontStyle: t.fontStyle,
              textDecoration: t.textDecoration,
              transform: `rotate(${t.rotation}deg)` + (isActive ? ' scale(1.02)' : ''),
              border: isActive ? '3px solid #3b82f6' : '2px solid #ccc',
              boxSizing: 'border-box',
              cursor: draggingId === t.id ? 'grabbing' : 'grab',
              zIndex: isActive ? 100 : 1,
              background: 'transparent',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              textAlign: t.textAlign as any,
              pointerEvents: 'auto',
            }}
            onMouseDown={e => handleOverlayStart(e, t.id)}
            onTouchStart={e => handleOverlayStart(e, t.id)}
            onClick={e => {
              e.stopPropagation();
              setTextOverlays(prev => prev.map(text => ({ ...text, selected: text.id === t.id })));
              setOverlayImages(prev => prev.map(img => ({ ...img, selected: false })));
              setActiveText(t);
            }}
          >
            {editingTextId === t.id ? (
              <input
                type="text"
                value={t.content}
                onChange={e => setTextOverlays(prev => prev.map(txt => txt.id === t.id ? { ...txt, content: e.target.value } : txt))}
                onBlur={() => setEditingTextId(null)}
                autoFocus
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  fontSize: t.fontSize, 
                  fontFamily: t.fontFamily, 
                  color: t.color, 
                  background: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  textAlign: t.textAlign as any 
                }}
              />
            ) : (
              <div
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  cursor: 'grab', 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  pointerEvents: 'auto',
                  userSelect: 'none'
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingTextId(t.id);
                }}
              >
                {t.content}
              </div>
            )}
            
            {isActive && (
              <>
                {/* Resize handles */}
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('se')}
                  onMouseDown={e => handleResizeStart(e, t.id, 'se')}
                  onTouchStart={e => handleResizeStart(e, t.id, 'se')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('sw')}
                  onMouseDown={e => handleResizeStart(e, t.id, 'sw')}
                  onTouchStart={e => handleResizeStart(e, t.id, 'sw')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('ne')}
                  onMouseDown={e => handleResizeStart(e, t.id, 'ne')}
                  onTouchStart={e => handleResizeStart(e, t.id, 'ne')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('nw')}
                  onMouseDown={e => handleResizeStart(e, t.id, 'nw')}
                  onTouchStart={e => handleResizeStart(e, t.id, 'nw')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('n')}
                  onMouseDown={e => handleResizeStart(e, t.id, 'n')}
                  onTouchStart={e => handleResizeStart(e, t.id, 'n')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('s')}
                  onMouseDown={e => handleResizeStart(e, t.id, 's')}
                  onTouchStart={e => handleResizeStart(e, t.id, 's')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('w')}
                  onMouseDown={e => handleResizeStart(e, t.id, 'w')}
                  onTouchStart={e => handleResizeStart(e, t.id, 'w')}
                />
                <div
                  className={`resize-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={getResizeHandleStyle('e')}
                  onMouseDown={e => handleResizeStart(e, t.id, 'e')}
                  onTouchStart={e => handleResizeStart(e, t.id, 'e')}
                />
                
                {/* Rotate handle */}
                <div
                  className={`rotate-handle ${isLowResolution ? 'low-res-handle' : ''}`}
                  style={{
                    position: 'absolute',
                    width: isLowResolution ? 35 : 20,
                    height: isLowResolution ? 35 : 20,
                    backgroundColor: '#3b82f6',
                    left: '50%',
                    top: isLowResolution ? -40 : -30,
                    marginLeft: isLowResolution ? -17.5 : -10,
                    borderRadius: '50%',
                    cursor: 'grab',
                    zIndex: 101,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: isLowResolution ? 16 : 12,
                    border: isLowResolution ? '2px solid #ffffff' : 'none',
                    boxShadow: isLowResolution ? '0 0 4px rgba(0, 0, 0, 0.3)' : 'none'
                  }}
                  onMouseDown={e => handleRotateStart(e, t.id)}
                  onTouchStart={e => handleRotateStart(e, t.id)}
                >
                  ↻
                </div>
                
                {/* Delete button */}
                <button
                  style={{
                    position: 'absolute',
                    right: -15,
                    top: -15,
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: 25,
                    height: 25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 101
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTextOverlays(prev => prev.filter(text => text.id !== t.id));
                    if (activeText?.id === t.id) setActiveText(null);
                  }}
                >
                  ×
                </button>
              </>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Design Studio</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/ai-generator')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <FaRobot /> AI Generator
            </button>
            <button
              onClick={handleSaveDesign}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaSave /> Save Design
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Design Controls */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaPalette className="text-blue-600" /> Design Options
            </h2>
            
            <div className="space-y-4">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={designState.product}
                  onChange={(e) => setDesignState({ ...designState, product: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {loadingProducts ? (
                    <option>Loading products...</option>
                  ) : (
                    products.map(product => (
                      <option key={product} value={product}>{product}</option>
                    ))
                  )}
                </select>
              </div>
              
              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setDesignState({ ...designState, color: color.name })}
                      className={`w-8 h-8 rounded-full border-2 ${designState.color === color.name ? 'border-blue-500' : 'border-gray-300'}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setDesignState({ ...designState, size })}
                      className={`px-3 py-1 rounded-md ${designState.size === size ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* View Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
                <div className="flex flex-wrap gap-2">
                  {views.map(view => (
                    <button
                      key={view}
                      onClick={() => setDesignState({ ...designState, view })}
                      className={`px-3 py-1 rounded-md flex items-center gap-1 ${designState.view === view ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      <FaEye /> {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Add Text Section */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaFont className="text-blue-600" /> Add Text
              </h2>
              
              <div className="space-y-3">
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Enter your text here..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Size:</label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded-md"
                    min="8"
                    max="200"
                  />
                  
                  <button
                    onClick={() => setFontSize(prev => Math.max(8, prev - 2))}
                    className="p-1 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    <FiMinus />
                  </button>
                  
                  <button
                    onClick={() => setFontSize(prev => Math.min(200, prev + 2))}
                    className="p-1 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    <FiPlus />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Font:</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="flex-1 p-1 border border-gray-300 rounded-md"
                  >
                    {FONT_FAMILIES.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Color:</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-8 h-8 rounded-md border border-gray-300"
                      style={{ backgroundColor: textColor }}
                    />
                    {showColorPicker && (
                      <div className="absolute z-10 mt-1">
                        <ChromePicker
                          color={textColor}
                          onChange={(color) => setTextColor(color.hex)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={addText}
                  className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <FaFont /> Add Text
                </button>
              </div>
            </div>
            
            {/* Text Formatting Options */}
            {activeText && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <h3 className="font-medium mb-2">Text Formatting</h3>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTextStyle(activeText.id, 'fontWeight', activeText.fontWeight === 'bold' ? 'normal' : 'bold')}
                      className={`p-2 rounded-md ${activeText.fontWeight === 'bold' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      <FaBold />
                    </button>
                    
                    <button
                      onClick={() => updateTextStyle(activeText.id, 'fontStyle', activeText.fontStyle === 'italic' ? 'normal' : 'italic')}
                      className={`p-2 rounded-md ${activeText.fontStyle === 'italic' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      <FaItalic />
                    </button>
                    
                    <button
                      onClick={() => updateTextStyle(activeText.id, 'textDecoration', activeText.textDecoration === 'underline' ? 'none' : 'underline')}
                      className={`p-2 rounded-md ${activeText.textDecoration === 'underline' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      <FaUnderline />
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateTextStyle(activeText.id, 'textAlign', 'left')}
                      className={`p-2 rounded-md ${activeText.textAlign === 'left' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      <FaAlignLeft />
                    </button>
                    
                    <button
                      onClick={() => updateTextStyle(activeText.id, 'textAlign', 'center')}
                      className={`p-2 rounded-md ${activeText.textAlign === 'center' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      <FaAlignCenter />
                    </button>
                    
                    <button
                      onClick={() => updateTextStyle(activeText.id, 'textAlign', 'right')}
                      className={`p-2 rounded-md ${activeText.textAlign === 'right' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                      <FaAlignRight />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Size:</label>
                    <input
                      type="number"
                      value={activeText.fontSize}
                      onChange={(e) => updateTextStyle(activeText.id, 'fontSize', Number(e.target.value))}
                      className="w-16 p-1 border border-gray-300 rounded-md"
                      min="8"
                      max="200"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Color:</label>
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-8 h-8 rounded-md border border-gray-300"
                        style={{ backgroundColor: activeText.color }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload Images Section */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FaImage className="text-blue-600" /> Upload Images
              </h2>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-md p-6 text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              >
                <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-3">Drag & drop images here or click to browse</p>
                
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Browse Files
                </label>
              </div>
            </div>
          </div>
          
          {/* Main Canvas Area */}
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaTshirt className="text-blue-600" /> Design Preview
            </h2>
            
            <div className="flex justify-center mb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setZoom(prev => Math.max(25, prev - 25))}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  disabled={zoom <= 25}
                >
                  <FaCompress />
                </button>
                
                <span className="px-3 py-2 bg-gray-100 rounded-md">{zoom}%</span>
                
                <button
                  onClick={() => setZoom(prev => Math.min(200, prev + 25))}
                  className="p-2 bg-gray-200 rounded-md hover:bg-gray-300"
                  disabled={zoom >= 200}
                >
                  <FaExpand />
                </button>
              </div>
            </div>
            
            <div className="relative border border-gray-300 rounded-md bg-gray-100 flex justify-center items-center p-4 overflow-hidden">
              <div
                className="max-w-full"
                style={{
                  width: `${containerSize.width * (zoom / 100)}px`,
                  height: `${containerSize.height * (zoom / 100)}px`,
                  position: 'relative',
                  transformOrigin: 'top left'
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={containerSize.width}
                  height={containerSize.height}
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1,
                    border: '1px solid #ddd'
                  }}
                />
                
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                    pointerEvents: 'none'
                  }}
                >
                  {renderImageOverlays()}
                  {renderTextOverlays()}
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar - Design Tools */}
          <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaMagic className="text-blue-600" /> Design Tools
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Layers</h3>
                <div className="bg-gray-100 rounded-md p-3 max-h-60 overflow-y-auto">
                  {overlayImages.length === 0 && textOverlays.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No layers added yet</p>
                  )}
                  
                  {overlayImages.map(img => (
                    <div
                      key={img.id}
                      className={`p-2 mb-1 rounded-md flex items-center justify-between ${img.selected ? 'bg-blue-100' : 'bg-white'}`}
                      onClick={() => {
                        setOverlayImages(prev => prev.map(image => ({ ...image, selected: image.id === img.id })));
                        setTextOverlays(prev => prev.map(text => ({ ...text, selected: false })));
                        setActiveText(null);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FaImage className="text-gray-500" />
                        <span className="text-sm truncate max-w-xs">Image {img.id.slice(0, 4)}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOverlayImages(prev => prev.filter(image => image.id !== img.id));
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {textOverlays.map(text => (
                    <div
                      key={text.id}
                      className={`p-2 mb-1 rounded-md flex items-center justify-between ${text.selected ? 'bg-blue-100' : 'bg-white'}`}
                      onClick={() => {
                        setTextOverlays(prev => prev.map(txt => ({ ...txt, selected: txt.id === text.id })));
                        setOverlayImages(prev => prev.map(img => ({ ...img, selected: false })));
                        setActiveText(text);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FaFont className="text-gray-500" />
                        <span className="text-sm truncate max-w-xs">{text.content || 'Text'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTextOverlays(prev => prev.filter(txt => txt.id !== text.id));
                          if (activeText?.id === text.id) setActiveText(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center justify-center gap-1">
                    <FaUndo /> Undo
                  </button>
                  <button className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 flex items-center justify-center gap-1">
                    <FaRedo /> Redo
                  </button>
                  <button 
                    className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center justify-center gap-1 col-span-2"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all design elements?')) {
                        setOverlayImages([]);
                        setTextOverlays([]);
                        setActiveText(null);
                      }
                    }}
                  >
                    <FaTrash /> Clear All
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Design Info</h3>
                <div className="bg-gray-100 rounded-md p-3 text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Product:</span>
                    <span className="font-medium">{designState.product}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Color:</span>
                    <span className="font-medium">{designState.color}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Size:</span>
                    <span className="font-medium">{designState.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>View:</span>
                    <span className="font-medium">{designState.view}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;