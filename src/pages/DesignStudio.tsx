import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  FaTshirt, FaPalette, FaEye, FaFont, FaImage, FaSave, 
  FaUndo, FaRedo, FaTrash, FaCloudUploadAlt,
  FaBold, FaItalic, FaUnderline, FaAlignLeft,
  FaAlignCenter, FaAlignRight, FaPlus, FaExpand, FaCompress, FaMagic,
  FaRuler
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
  const [isDarkTheme] = useState(false);

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

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Helper to get product image path
  function getProductImage(product: string, color: string, view: string): string {
    if (
      productImages[product] &&
      productImages[product][color] &&
      productImages[product][color][view]
    ) {
      return productImages[product][color][view];
    }
    return '/images/black t-shirts/black-front.jpg';
  }

  const productImages: Record<string, any> = {
    'V-neck t-shirt': {
      'black': {
        'front': '/images/black t-shirts/black-front.jpg',
        'back': '/images/black t-shirts/behind.jpg',
        'left': '/images/black t-shirts/left.jpg',
        'right': '/images/black t-shirts/right.jpg'
      },
      'white': {
        'front': '/images/white t-shirts/front.jpg',
        'back': '/images/white t-shirts/back.jpg',
        'left': '/images/white t-shirts/left.jpg',
        'right': '/images/white t-shirts/right.jpg'
      },
      'red': {
        'front': '/images/red t-shirts/front.jpg',
        'back': '/images/red t-shirts/back.jpg',
        'left': '/images/red t-shirts/left.jpg',
        'right': '/images/red t-shirts/right.jpg'
      },
      'navy': {
        'front': '/images/navy t-shirts/front.jpg',
        'back': '/images/navy t-shirts/back.jpg',
        'left': '/images/navy t-shirts/left.jpg',
        'right': '/images/navy t-shirts/right.jpg'
      }
    },
    'Hoodie': {
      'black': {
        'front': '/images/hoodies/black/front-hq.jpg',
        'back': '/images/hoodies/black/back-hq.jpg'
      },
      'gray': {
        'front': '/images/hoodies/gray/front-hq.jpg',
        'back': '/images/hoodies/gray/back-hq.jpg'
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
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!overlayContainerRef.current) return;
      
      const rect = overlayContainerRef.current.getBoundingClientRect();
      const scaleX = containerSize.width / rect.width;
      const scaleY = containerSize.height / rect.height;
      
      if (draggingId) {
        let x = (e.clientX - rect.left) * scaleX;
        let y = (e.clientY - rect.top) * scaleY;
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
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
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
                break;
              case 'sw':
                newWidth = Math.max(40, Math.min(1000, text.x + (text.width || 200) - mouseX));
                newHeight = Math.max(40, Math.min(600, mouseY - text.y));
                newX = mouseX;
                break;
              case 'ne':
                newWidth = Math.max(40, Math.min(1000, mouseX - text.x));
                newHeight = Math.max(40, Math.min(600, text.y + (text.height || 50) - mouseY));
                newY = mouseY;
                break;
              case 'nw':
                newWidth = Math.max(40, Math.min(1000, text.x + (text.width || 200) - mouseX));
                newHeight = Math.max(40, Math.min(600, text.y + (text.height || 50) - mouseY));
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
            const newFontSize = Math.max(8, Math.round(baseFontSize * (newHeight / baseHeight)));
            return { ...text, x: newX, y: newY, width: newWidth, height: newHeight, fontSize: newFontSize };
          }));
        }
      }
    };

    const handleGlobalMouseUp = () => {
      setDraggingId(null);
      setResizingId(null);
      setResizeDir('');
      setRotatingId(null);
      setDragOffset(null);
    };

    if (draggingId || resizingId || rotatingId) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [draggingId, resizingId, resizeDir, rotatingId, containerSize.width, containerSize.height]);

  // useEffect for preview rendering only
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
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
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

    // Draw all image overlays with exact positioning (no translation)
    for (const img of overlayImages) {
      await new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = () => {
          tempCtx.save();
          tempCtx.globalAlpha = img.opacity;
          
          // Move to the center of the image position
          const centerX = img.x + 1.35*img.width;
          const centerY = img.y + 0.82*img.height;
          
          // Move to the center point where we want to rotate
          tempCtx.translate(centerX, centerY);
          
          // Rotate around the center
          tempCtx.rotate((img.rotation * Math.PI) / 180);
          
          // Draw the image centered at the rotation point
          tempCtx.drawImage(
            image,
            -1.1*img.width,  // x offset to center
            -img.height/1.53, // y offset to center
            1.1*img.width,
            img.height/1.53
          );
          
          tempCtx.restore();
          resolve();
        };
        image.src = img.src;
      });
    }

    // Draw all text overlays with proper positioning and rotation
    textOverlays.forEach(text => {
      tempCtx.save();
      
      // Set text styles
      tempCtx.font = `${text.fontWeight} ${text.fontStyle} ${text.fontSize}px ${text.fontFamily}`;
      tempCtx.fillStyle = text.color;
      tempCtx.textAlign = 'center'; // Center alignment works better with rotation
      tempCtx.textBaseline = 'middle'; // Middle baseline works better with rotation
      
      // Calculate text position center
      const textWidth = text.width || 200;
      const textHeight = text.height || 50;
      const centerX = text.x + 2.15*textWidth;
      const centerY = text.y + 0.5*textHeight;
      
      // Move to the center of the text position
      tempCtx.translate(centerX, centerY);
      
      // Rotate around the center
      tempCtx.rotate((text.rotation * Math.PI) / 180);
      
      // Draw the text centered at the rotation point
      // We need to measure the text to handle wrapping properly
      const lines = text.content.split('\n');
      const lineHeight = text.fontSize * 1.2;
      const startY = -(lines.length - 1) * lineHeight / 2;
      
      lines.forEach((line, i) => {
        tempCtx.fillText(
          line,
          0,
          startY + i * lineHeight,
          textWidth // maxWidth for text wrapping
        );
      });
      
      tempCtx.restore();
    });

    // Convert to data URL
    const imageData = tempCanvas.toDataURL('image/png', 1.0);
    
    // Create payload
    const payload = {
      image: imageData,
      product: designState.product,
      color: designState.color,
      view: designState.view,
      size: designState.size,
      overlays: {
        images: overlayImages.map(img => ({
          src: img.src,
          x: img.x,
          y: img.y,
          width: img.width,
          height: img.height,
          rotation: img.rotation,
          opacity: img.opacity
        })),
        texts: textOverlays.map(text => ({
          content: text.content,
          x: text.x,
          y: text.y,
          width: text.width,
          height: text.height,
          fontSize: text.fontSize,
          color: text.color,
          fontFamily: text.fontFamily,
          fontWeight: text.fontWeight,
          fontStyle: text.fontStyle,
          textDecoration: text.textDecoration,
          textAlign: text.textAlign,
          rotation: text.rotation
        }))
      }
    };

    // Send to server
    const response = await apiService.saveDesign(payload);

    if (response.success) {
      alert('Design saved successfully!');
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

  const handleOverlayMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
    setResizingId(null);

    const imageOverlay = overlayImages.find(img => img.id === id);
    const textOverlay = textOverlays.find(text => text.id === id);
    let overlay = imageOverlay || textOverlay;
    if (overlay) {
      const rect = overlayContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = (e.clientX - rect.left) * (containerSize.width / rect.width);
        const mouseY = (e.clientY - rect.top) * (containerSize.height / rect.height);
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

  const handleResizeMouseDown = (e: React.MouseEvent, id: string, direction: string) => {
    e.stopPropagation();
    setResizingId(id);
    setResizeDir(direction);
    setDraggingId(null);
  };

  const handleRotateMouseDown = (e: React.MouseEvent, id: string) => {
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
            onMouseDown={e => handleOverlayMouseDown(e, img.id)}
            onClick={e => {
              e.stopPropagation();
              setOverlayImages(prev => prev.map(image => ({ ...image, selected: image.id === img.id })));
              setTextOverlays(prev => prev.map(text => ({ ...text, selected: false })));
              setActiveText(null);
            }}
          >
            <img
              src={img.src}
              alt="uploaded"
              style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }}
              draggable={false}
            />
            
            {isActive && (
              <>
                {/* Resize handles */}
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    right: -5,
                    bottom: -5,
                    cursor: 'nwse-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, img.id, 'se')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: -5,
                    bottom: -5,
                    cursor: 'nesw-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, img.id, 'sw')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    right: -5,
                    top: -5,
                    cursor: 'nesw-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, img.id, 'ne')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: -5,
                    top: -5,
                    cursor: 'nwse-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, img.id, 'nw')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: '50%',
                    top: -5,
                    marginLeft: -5,
                    cursor: 'ns-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, img.id, 'n')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: '50%',
                    bottom: -5,
                    marginLeft: -5,
                    cursor: 'ns-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, img.id, 's')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: -5,
                    top: '50%',
                    marginTop: -5,
                    cursor: 'ew-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, img.id, 'w')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    right: -5,
                    top: '50%',
                    marginTop: -5,
                    cursor: 'ew-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, img.id, 'e')}
                />
                
                {/* Rotate handle */}
                <div
                  style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    backgroundColor: '#3b82f6',
                    left: '50%',
                    top: -30,
                    marginLeft: -10,
                    borderRadius: '50%',
                    cursor: 'grab',
                    zIndex: 101,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12
                  }}
                  onMouseDown={e => handleRotateMouseDown(e, img.id)}
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
            onMouseDown={e => handleOverlayMouseDown(e, t.id)}
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
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    right: -5,
                    bottom: -5,
                    cursor: 'nwse-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, t.id, 'se')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: -5,
                    bottom: -5,
                    cursor: 'nesw-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, t.id, 'sw')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    right: -5,
                    top: -5,
                    cursor: 'nesw-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, t.id, 'ne')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: -5,
                    top: -5,
                    cursor: 'nwse-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, t.id, 'nw')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: '50%',
                    top: -5,
                    marginLeft: -5,
                    cursor: 'ns-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, t.id, 'n')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: '50%',
                    bottom: -5,
                    marginLeft: -5,
                    cursor: 'ns-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, t.id, 's')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    left: -5,
                    top: '50%',
                    marginTop: -5,
                    cursor: 'ew-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, t.id, 'w')}
                />
                <div
                  style={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: '#3b82f6',
                    right: -5,
                    top: '50%',
                    marginTop: -5,
                    cursor: 'ew-resize',
                    zIndex: 101
                  }}
                  onMouseDown={e => handleResizeMouseDown(e, t.id, 'e')}
                />
                
                {/* Rotate handle */}
                <div
                  style={{
                    position: 'absolute',
                    width: 20,
                    height: 20,
                    backgroundColor: '#3b82f6',
                    left: '50%',
                    top: -30,
                    marginLeft: -10,
                    borderRadius: '50%',
                    cursor: 'grab',
                    zIndex: 101,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 12
                  }}
                  onMouseDown={e => handleRotateMouseDown(e, t.id)}
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
                    if (activeText?.id === t.id) {
                      setActiveText(null);
                    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`rounded-xl shadow-lg p-6 sticky top-24 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="mb-6">
                <h5 className="text-lg font-semibold mb-3 flex items-center">
                  <FaTshirt className={`mr-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} /> 
                  Product Type
                </h5>
                {loadingProducts ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading products...</span>
                  </div>
                ) : products.length > 0 ? (
                  <div 
                    className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1" 
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${isDarkTheme ? '#3b82f6 #4b5563' : '#3b82f6 #e5e7eb'}`,
                    }}
                  >
                    {products.map(product => (
                      <button
                        key={product}
                        onClick={() => setDesignState({...designState, product})}
                        className={`px-3 py-2 rounded-md transition-all flex-shrink-0 ${
                          designState.product === product 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : `${isDarkTheme ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'}`
                        }`}
                      >
                        {product}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-gray-500">
                    No in-stock products available
                  </div>
                )}
              </div>
              
              <div className="mb-6">
                <h5 className="text-lg font-semibold mb-3 flex items-center">
                  <FaPalette className={`mr-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} /> 
                  Colors
                </h5>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setDesignState({...designState, color: color.name})}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${designState.color === color.name 
                        ? 'border-blue-500 scale-110 shadow-md' 
                        : `${isDarkTheme ? 'border-gray-600 hover:scale-105' : 'border-gray-300 hover:scale-105'}`}`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h5 className="text-lg font-semibold mb-3 flex items-center">
                  <FaRuler className={`mr-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} /> 
                  Size
                </h5>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setDesignState({...designState, size})}
                      className={`px-3 py-2 rounded-md transition-all ${designState.size === size 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : `${isDarkTheme ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'}`}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h5 className="text-lg font-semibold mb-3 flex items-center">
                  <FaEye className={`mr-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} /> 
                  View Angle
                </h5>
                <div className="flex flex-wrap gap-2">
                  {views.map(view => (
                    <button
                      key={view}
                      onClick={() => setDesignState({...designState, view})}
                      className={`px-3 py-2 rounded-md flex items-center transition-all ${designState.view === view 
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                        : `${isDarkTheme ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'border-gray-300 hover:bg-gray-100'}`}`}
                    >
                      <FaTshirt className="mr-2" /> 
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h5 className="text-lg font-semibold mb-3 flex items-center">
                  <FaFont className={`mr-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} /> 
                  Text
                </h5>
                <input 
                  type="text" 
                  value={newText} 
                  onChange={e => setNewText(e.target.value)} 
                  placeholder="Enter your text" 
                  className={`w-full px-3 py-2 mb-2 rounded-md border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                />
                <div className="flex flex-wrap gap-2 mb-2">
                  <button 
                    className={`p-2 rounded-md ${activeText?.fontWeight === 'bold' ? 'bg-blue-600 text-white' : isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateTextStyle(activeText?.id || '', 'fontWeight', activeText?.fontWeight === 'bold' ? 'normal' : 'bold')}
                    title="Bold"
                  >
                    <FaBold />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${activeText?.fontStyle === 'italic' ? 'bg-blue-600 text-white' : isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateTextStyle(activeText?.id || '', 'fontStyle', activeText?.fontStyle === 'italic' ? 'normal' : 'italic')}
                    title="Italic"
                  >
                    <FaItalic />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${activeText?.textDecoration === 'underline' ? 'bg-blue-600 text-white' : isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateTextStyle(activeText?.id || '', 'textDecoration', activeText?.textDecoration === 'underline' ? 'none' : 'underline')}
                    title="Underline"
                  >
                    <FaUnderline />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${activeText?.textAlign === 'left' ? 'bg-blue-600 text-white' : isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateTextStyle(activeText?.id || '', 'textAlign', 'left')}
                    title="Align Left"
                  >
                    <FaAlignLeft />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${activeText?.textAlign === 'center' ? 'bg-blue-600 text-white' : isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateTextStyle(activeText?.id || '', 'textAlign', 'center')}
                    title="Align Center"
                  >
                    <FaAlignCenter />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${activeText?.textAlign === 'right' ? 'bg-blue-600 text-white' : isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => updateTextStyle(activeText?.id || '', 'textAlign', 'right')}
                    title="Align Right"
                  >
                    <FaAlignRight />
                  </button>
                  <div className="relative">
                    <button 
                      className={`p-2 rounded-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      title="Text Color"
                    >
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: activeText?.color || textColor }} />
                    </button>
                    {showColorPicker && (
                      <div className="absolute z-50 mt-2">
                        <ChromePicker
                          color={activeText?.color || textColor}
                          onChangeComplete={(color: any) => {
                            if (activeText) {
                              updateTextStyle(activeText.id, 'color', color.hex);
                            }
                            setTextColor(color.hex);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <select
                  value={fontFamily}
                  onChange={e => setFontFamily(e.target.value)}
                  className={`w-full px-3 py-2 mb-2 rounded-md border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
                
                <div className="flex items-center mb-2">
                  <button 
                    className={`p-2 rounded-l-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => {
                      setFontSize(prev => Math.max(8, prev - 2));
                      if (activeText) {
                        updateTextStyle(activeText.id, 'fontSize', Math.max(8, activeText.fontSize - 2));
                      }
                    }}
                  >
                    <FiMinus />
                  </button>
                  <div className={`flex-1 text-center px-2 py-1 ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {activeText ? activeText.fontSize : fontSize}px
                  </div>
                  <button 
                    className={`p-2 rounded-r-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => {
                      setFontSize(prev => Math.min(100, prev + 2));
                      if (activeText) {
                        updateTextStyle(activeText.id, 'fontSize', Math.min(100, activeText.fontSize + 2));
                      }
                    }}
                  >
                    <FiPlus />
                  </button>
                </div>
                
                <button 
                  className={`w-full px-4 py-2 rounded-md flex items-center justify-center ${isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  onClick={addText}
                >
                  <FaPlus className="mr-2" />Add Text
                </button>
              </div>
              
              <div className="mb-6">
                <h5 className="text-lg font-semibold mb-3 flex items-center">
                  <FaImage className={`mr-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} /> 
                  Upload Image
                </h5>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 mb-2 text-center cursor-pointer transition-colors ${isDragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : isDarkTheme ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <label className="cursor-pointer flex flex-col items-center">
                    <FaCloudUploadAlt className={`text-3xl mb-2 ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
                      Drag & Drop or Click to Upload
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleFileInputChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <button 
                    className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center ${isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                    onClick={() => {
                      const fileInput = document.querySelector('input[type=file]') as HTMLInputElement | null;
                      fileInput?.click();
                    }}
                  >
                    <FaCloudUploadAlt className="mr-2" />Upload
                  </button>
                  <button 
                    className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center ${isDarkTheme ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                    onClick={() => { setOverlayImages([]); setTextOverlays([]); setActiveText(null); setEditingTextId(null); }}
                  >
                    <FaTrash className="mr-2" />Clear
                  </button>
                </div>
              </div>
              
              <button 
                className={`w-full px-4 py-3 rounded-md mb-2 flex items-center justify-center ${isDarkTheme ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700 text-white'} font-semibold`}
                onClick={handleSaveDesign}
              >
                <FaSave className="mr-2" />Save Design
              </button>
              <button 
                className={`w-full px-4 py-3 rounded-md mb-2 flex items-center justify-center ${isDarkTheme ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700 text-white'} font-semibold`}
                onClick={() => navigate('/ai-generator')}
              >
                <FaMagic className="mr-2" />Generate with AI
              </button>
              <div className="flex gap-2">
                <button 
                  className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => {/* Undo logic */}}
                >
                  <FaUndo className="mr-2" />Undo
                </button>
                <button 
                  className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                  onClick={() => {/* Redo logic */}}
                >
                  <FaRedo className="mr-2" />Redo
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <div className={`rounded-xl shadow-lg p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-xl font-semibold">Design Preview</h4>
                <div className="flex items-center space-x-2">
                  <button 
                    className={`p-2 rounded-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => setZoom(prev => Math.max(25, prev - 10))}
                    title="Zoom Out"
                  >
                    <FiMinus />
                  </button>
                  <span className={`px-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>{zoom}%</span>
                  <button 
                    className={`p-2 rounded-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => setZoom(prev => Math.min(200, prev + 10))}
                    title="Zoom In"
                  >
                    <FiPlus />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    onClick={() => setZoom(100)}
                    title="Reset Zoom"
                  >
                    {zoom === 100 ? <FaExpand /> : <FaCompress />}
                  </button>
                </div>
              </div>
              
              <div className={`rounded-lg p-4 flex justify-center relative min-h-[600px] ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div 
                  style={{ 
                    width: `${containerSize.width * zoom / 100}px`, 
                    height: `${containerSize.height * zoom / 100}px`, 
                    position: 'relative',
                    transform: `scale(${zoom/100})`,
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
                      display: 'block', 
                      border: isDarkTheme ? '1px solid #4b5563' : '1px solid #d1d5db',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }} 
                  />
                  {renderImageOverlays()}
                  {renderTextOverlays()}
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