import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {FaPlus,FaLock, FaUnlock, FaShoppingCart, FaStar, FaRegStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



interface TShirtTemplate {
  id: number;
  name: string;
  description: string;
  image_url: string;
  status: 'in_stock' | 'out_of_stock';
  price?: string;
  size?: string;
  average_rating?: number;
  rating_count?: number;
}

interface CombinedDesign {
  id: number;
  name: string;
  description: string;
  image_url: string;
  status: 'in_stock' | 'out_of_stock';
  type: 'combined';
  source_templates: number[];
  average_rating?: number;
  rating_count?: number;
}

interface UserRatings {
  [key: number]: number;
}


const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<(TShirtTemplate | CombinedDesign)[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<TShirtTemplate>>({
    name: '',
    description: '',
    status: 'in_stock',
    price: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isRegularUser = user?.role === 'user';
  const templatesBoxRef = useRef<HTMLDivElement | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TShirtTemplate | CombinedDesign | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Partial<TShirtTemplate>>({});
  const [editingFile, setEditingFile] = useState<File | null>(null);
  const [editingCurrency, setEditingCurrency] = useState<'USD' | 'EUR' | 'TND'>('EUR');
  const [editingConvertedPrice, setEditingConvertedPrice] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'TND'>('EUR');
  const [convertedPrice, setConvertedPrice] = useState('');
  const [userRatings, setUserRatings] = useState<UserRatings>({});
  const [hoverRating, setHoverRating] = useState<{[key: number]: number}>({});
  const [keepModalOpen, setKeepModalOpen] = useState(false);

  
  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const tempRes = await apiService.getGalleryTemplates();
      setTemplates((tempRes.data as unknown as (TShirtTemplate | CombinedDesign)[]) || []);
      
      // Ensure user_ratings is properly initialized
      if (tempRes && 'user_ratings' in tempRes && tempRes.user_ratings) {
        // Convert any string values to numbers
        const ratings: UserRatings = {};
        for (const [key, value] of Object.entries(tempRes.user_ratings)) {
          ratings[Number(key)] = Number(value);
        }
        setUserRatings(ratings);
      } else {
        setUserRatings({});
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  const handleRateTemplate = async (templateId: number, rating: number) => {
    if (!isRegularUser) {
      toast.error('Only regular users can rate templates');
      return;
    }
    
    try {
      const response = await apiService.updateGalleryTemplateRating(templateId, { rating });
      
      if (response.success) {
        // Update user's rating
        setUserRatings(prev => ({ ...prev, [templateId]: rating }));
        
        // Update the template with new average rating
        setTemplates(prevTemplates => 
          prevTemplates.map(template => {
            if (template.id === templateId) {
              // Calculate new average and count
              const currentRating = template.average_rating || 0;
              const currentCount = template.rating_count || 0;
              const userPreviousRating = userRatings[templateId] || 0;
              
              let newAverage, newCount;
              
              if (userPreviousRating > 0) {
                // Updating existing rating
                newAverage = ((currentRating * currentCount) - userPreviousRating + rating) / currentCount;
                newCount = currentCount;
              } else {
                // Adding new rating
                newAverage = ((currentRating * currentCount) + rating) / (currentCount + 1);
                newCount = currentCount + 1;
              }
              
              return {
                ...template,
                average_rating: parseFloat(newAverage.toFixed(1)),
                rating_count: newCount
              };
            }
            return template;
          })
        );
        
        toast.success('Rating submitted successfully');
      } else {
        toast.error(response.message || 'Failed to submit rating');
      }
    } catch (e) {
      console.error('Failed to submit rating:', e);
      toast.error('Failed to submit rating');
    }
  };

  const handleUploadClick = () => {
    if (!isAdmin) {
      toast.error('Only admins can upload templates');
      return;
    }
    setShowUpload(true);
    setNewTemplate({ name: '', description: '', status: 'in_stock', price: '' });
  };

  const handleUpload = async () => {
    if (!isAdmin) return;
    if (!selectedFile || !newTemplate.name || !newTemplate.description) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      Object.entries(newTemplate).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value));
      });
      
      await apiService.uploadGalleryTemplate(formData);
      const tempRes = await apiService.getGalleryTemplates();
      setTemplates((tempRes.data as unknown as TShirtTemplate[]) || []);
      
      setNewTemplate({
        name: '',
        description: '',
        status: 'in_stock',
        price: ''
      });
      setSelectedFile(null);
      setShowUpload(false);
      setTimeout(() => {
        templatesBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (e) {
      console.error('Upload failed:', e);
      toast.error('Upload failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const toggleStockStatus = async (templateId: number, currentStatus: 'in_stock' | 'out_of_stock') => {
    if (!isAdmin) return;
    try {
      const newStatus = currentStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
      await apiService.updateGalleryTemplateStatus(templateId, { status: newStatus });
      
      setTemplates(templates.map(t => 
        t.id === templateId ? { ...t, status: newStatus } : t
      ));
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleTemplateClick = async (template: TShirtTemplate | CombinedDesign) => {
    try {
      setLoading(true);
      const response = await apiService.getGalleryTemplate(template.id);
      if (response.success && response.data) {
        setSelectedTemplate(response.data as unknown as TShirtTemplate | CombinedDesign);
        setShowTemplateModal(true);
        setCurrency('USD');
        setConvertedPrice('');
      } else {
        toast.error('Failed to load template details');
      }
    } catch (e) {
      console.error('Error fetching template details:', e);
      toast.error('Error fetching template details');
    } finally {
      setLoading(false);
    }
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!isAdmin) {
      toast.error('Only admins can delete templates');
      return;
    }
    try {
      await apiService.deleteGalleryTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully');
    } catch (e) {
      console.error('Failed to delete template:', e);
      toast.error('Failed to delete template');
    }
  };

  const handleAddToOrders = async (template: TShirtTemplate | CombinedDesign, event?: React.MouseEvent) => {
  try {
    let templateCardElement: HTMLElement | null = null;
    
    if (event) {
      const button = event.currentTarget as HTMLElement;
      templateCardElement = button.closest('.bg-white.rounded-xl.shadow-md.overflow-hidden') as HTMLElement;
    }
    
    let templateCardHtml = '';
    if (templateCardElement) {
      templateCardHtml = templateCardElement.outerHTML;
    }
    
    const enhancedData = {
      template_id: template.id,
      template_image: template.image_url,
      template_card_html: templateCardHtml,
      size: 'size' in template ? template.size : 'M', // Default to Medium if size not specified
      template_data: {
        id: template.id,
        name: template.name,
        description: template.description,
        image_url: template.image_url,
        status: template.status,
        price: 'price' in template ? template.price : null,
        size: 'size' in template ? template.size : null, // Include size in template data
        type: 'type' in template ? template.type : 'template'
      }
    };

    const response = await fetch('/api/simple-add-to-orders.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
      },
      body: JSON.stringify(enhancedData)
    });

      const result = await response.json();
      
      if (result.success) {
        const priceText = 'price' in template && template.price ? ` for $${parseFloat(template.price).toFixed(2)}` : '';
        toast.success(`"${template.name}" added to your orders${priceText}!`);
      } else {
        toast.error(result.message || 'Failed to add to orders');
      }
    } catch (err) {
      console.error('Error adding to orders:', err);
      toast.error('Failed to add to orders');
    }
  };

  const getPriceInCurrency = (price: string | undefined, targetCurrency: 'USD' | 'EUR' | 'TND') => {
    if (!price) return '0.00';
    const usdPrice = parseFloat(price);
    if (isNaN(usdPrice)) return '0.00';
    
    switch (targetCurrency) {
      case 'USD':
        return (usdPrice * 1.07).toFixed(2);
      case 'TND':
        return (usdPrice * 3.35).toFixed(2);
      default:
        return usdPrice.toFixed(2);
    }
  };

  const getCurrencySymbol = (currency:'EUR' |'USD' | 'TND') => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'TND':
        return 'د.ت';
      default:
        return '€';
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const NoTemplatesFound = () => (
    <div className="text-center py-20">
      <div className="text-lg mb-4 text-gray-600">No templates found matching your search.</div>
      {isAdmin && (
        <button
          onClick={handleUploadClick}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 shadow-md transition-all transform hover:scale-105"
        >
          Upload Your First Template
        </button>
      )}
    </div>
  );

  const handleEditClick = (template: TShirtTemplate | CombinedDesign) => {
    if (!isAdmin) return;
    setEditingTemplate({
      id: template.id,
      name: template.name,
      description: template.description,
      status: template.status,
      price: 'price' in template ? template.price : ''
    });
    setEditingFile(null);
    setEditingCurrency('EUR');
    setEditingConvertedPrice('');
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!isAdmin || !editingTemplate.id) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      if (editingFile) {
        formData.append('image', editingFile);
      }
      Object.entries(editingTemplate).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          formData.append(key, String(value));
        }
      });
      formData.append('id', String(editingTemplate.id));
      
      // For now, we'll use the same upload endpoint but with an ID
      // You might want to create a separate update endpoint
      await apiService.uploadGalleryTemplate(formData);
      
      // Refresh the templates list
      const tempRes = await apiService.getGalleryTemplates();
      setTemplates((tempRes.data as unknown as TShirtTemplate[]) || []);
      
      setShowEditModal(false);
      setEditingTemplate({});
      setEditingFile(null);
      toast.success('Template updated successfully');
    } catch (e) {
      console.error('Update failed:', e);
      toast.error('Update failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTemplate({});
    setEditingFile(null);
  };

  const renderStars = (template: TShirtTemplate | CombinedDesign) => {
    const averageRating = template.average_rating || 0;
    const ratingCount = template.rating_count || 0;
    const userRating = userRatings[template.id] || 0;
    const currentHover = hoverRating[template.id] || 0;
    
    return (
      <div className="flex items-center mt-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={(e) => {
                e.stopPropagation();
                handleRateTemplate(template.id, star);
              }}
              onMouseEnter={() => isRegularUser && setHoverRating(prev => ({ ...prev, [template.id]: star }))}
              onMouseLeave={() => isRegularUser && setHoverRating(prev => ({ ...prev, [template.id]: 0 }))}
              className="text-yellow-400 focus:outline-none"
              disabled={!isRegularUser}
            >
              {((currentHover || userRating || averageRating) >= star) ? (
                <FaStar className="w-5 h-5" />
              ) : (
                <FaRegStar className="w-5 h-5" />
              )}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-1">
          ({ratingCount})
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="shadow-lg"
      />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">T-Shirt Gallery</h1>
            <p className="text-gray-600">Browse our collection of t-shirt designs</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            {isAdmin && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={handleUploadClick}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <FaPlus /> Upload New
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-10">
          <div className="relative">
            <input
              type="text"
              className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all"
              placeholder="Search templates by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="absolute right-3 top-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Upload Form Modal */}
        {showUpload && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upload New Template</h2>
              <button 
                onClick={() => setShowUpload(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Summer Vibes Design"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newTemplate.name}
                    onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    placeholder="Describe your design..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    value={newTemplate.description}
                    onChange={e => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newTemplate.status}
                    onChange={e => setNewTemplate({ 
                      ...newTemplate, 
                      status: e.target.value as 'in_stock' | 'out_of_stock' 
                    })}
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 19.99"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={newTemplate.price ?? ''}
                    onChange={e => setNewTemplate({ ...newTemplate, price: e.target.value })}
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className={`px-3 py-1 rounded ${currency === 'EUR' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => {
                        setCurrency('EUR');
                        setConvertedPrice('');
                      }}
                    >
                      EUR
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded ${currency === 'USD' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => {
                        setCurrency('USD');
                        const price = parseFloat(newTemplate.price ? newTemplate.price : '0');
                        setConvertedPrice(price ? (price / 0.93).toFixed(2) : '');
                      }}
                    >
                      USD
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded ${currency === 'TND' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                      onClick={() => {
                        setCurrency('TND');
                        const price = parseFloat(newTemplate.price ? newTemplate.price : '0');
                        setConvertedPrice(price ? (price * 3.35).toFixed(2) : '');
                      }}
                    >
                      TND
                    </button>
                  </div>
                  {currency !== 'EUR' && convertedPrice && (
                    <div className="mt-1 text-sm text-gray-600">
                      Converted Price: {convertedPrice} {currency}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Template Image</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-7">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="pt-1 text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : 'Upload a high-quality image'}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="opacity-0" 
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        required
                      />
                    </label>
                  </div>
                </div>
                
                {selectedFile && (
                  <div className="mt-4">
                    <div className="border-4 border-blue-200 rounded-xl p-2 bg-white">
                      <img 
                        src={URL.createObjectURL(selectedFile)} 
                        alt="Preview" 
                        className="w-full h-48 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading || !selectedFile || !newTemplate.name || !newTemplate.description}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all ${
                      uploading || !selectedFile || !newTemplate.name || !newTemplate.description
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md'
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : 'Upload Template'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid Section */}
        <div className="mb-10" ref={templatesBoxRef}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <NoTemplatesFound />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {[...filteredTemplates].reverse().map(template => (
                  <motion.div 
                    key={template.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative"
                  >
                    {/* Status Badge */}
                    <div className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-semibold ${
                      template.status === 'in_stock' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {template.status === 'in_stock' ? 'Available' : 'Out of Stock'}
                    </div>
                    
                    {/* Admin Status Toggle */}
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStockStatus(template.id, template.status);
                        }}
                        className={`absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold ${
                          template.status === 'in_stock' 
                            ? 'bg-green-500 text-white hover:bg-green-600' 
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        {template.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                      </button>
                    )}
                    
                    {/* Template Image */}
                    <div 
                      className="h-64 bg-gray-100 flex items-center justify-center p-4 cursor-pointer"
                      onClick={() => handleTemplateClick(template)}
                    >
                      <img
                        src={template.image_url}
                        alt={template.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=T-Shirt+Template';
                        }}
                      />
                    </div>
                    
                    {/* Template Info */}
                    <div className="p-5">
                      <h3 
                        className="text-xl font-bold text-gray-800 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => handleTemplateClick(template)}
                      >
                        {template.name}
                      </h3>
                      <p 
                        className="text-gray-600 mb-2 line-clamp-2 cursor-pointer"
                        onClick={() => handleTemplateClick(template)}
                      >
                        {template.description}
                      </p>
                      
                      {/* Rating Stars */}
                      {renderStars(template)}
                      
                      {/* Price Display */}
                      {'price' in template && template.price && (
                        <div className="mb-4">
                          <span className="text-2xl font-bold text-green-600">
                            €{parseFloat(template.price).toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => handleTemplateClick(template)}
                          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex-1"
                        >
                          View Details
                        </button>
                        
                        {!isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAuthenticated) {
                                toast.error('Please log in to add items to your cart');
                                return;
                              }
                              handleAddToOrders(template, e);
                            }}
                            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 flex-1 ${
                              template.status === 'in_stock' && isAuthenticated
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={template.status !== 'in_stock' || !isAuthenticated}
                            title={!isAuthenticated ? "Please log in to add to cart" : template.status !== 'in_stock' ? "This item is out of stock" : ""}
                          >
                            <FaShoppingCart /> Add to Cart
                          </button>
                        )}
                        
                        {isAdmin && (
                          <>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(template);
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex-1"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
                                  handleDeleteTemplate(template.id);
                                }
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Template Detail Modal */}
        {showTemplateModal && selectedTemplate && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (keepModalOpen) {
            e.stopPropagation();
          } else {
            closeTemplateModal();
          }
        }}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">{selectedTemplate.name}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setKeepModalOpen(!keepModalOpen)}
                className={`p-2 rounded-full ${
                  keepModalOpen 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
                title={keepModalOpen ? 'Unlock modal (allow closing)' : 'Lock modal (prevent closing)'}
              >
                {keepModalOpen ? <FaLock className="w-5 h-5" /> : <FaUnlock className="w-5 h-5" />}
              </button>
              <button
                onClick={() => !keepModalOpen && closeTemplateModal()}
                className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors ${
                  keepModalOpen ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={keepModalOpen}
                title={keepModalOpen ? 'Modal is locked' : 'Close modal'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

              {/* Modal Content */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto">
                {/* Image Section */}
                <div className="lg:w-1/2 p-6 bg-gray-50 flex items-center justify-center">
                  <div className="border-4 border-blue-200 rounded-xl p-2 bg-white shadow-inner">
                    <img
                      src={selectedTemplate.image_url}
                      alt={selectedTemplate.name}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x600?text=T-Shirt+Template';
                      }}
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:w-1/2 p-6 flex flex-col">
                  <div className="flex-1">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                      selectedTemplate.status === 'in_stock' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className={`w-3 h-3 rounded-full mr-2 ${
                        selectedTemplate.status === 'in_stock' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      {selectedTemplate.status === 'in_stock' ? 'Available for orders' : 'Currently out of stock'}
                    </div>
            
                    <h3 className="text-3xl font-bold text-gray-800 mb-4">{selectedTemplate.name}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line mb-6">
                      {selectedTemplate.description}
                    </p>
            {/* Price Section */}
            {'price' in selectedTemplate && selectedTemplate.price && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Price</h4>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currency === 'EUR' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setCurrency('EUR')}
                  >
                    EUR
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currency === 'USD' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setCurrency('USD')}
                  >
                    USD
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currency === 'TND' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setCurrency('TND')}
                  >
                    TND
                  </button>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {getCurrencySymbol(currency)}{getPriceInCurrency(selectedTemplate.price, currency)}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4 pt-4 border-t">
            <button
              onClick={() => !keepModalOpen && closeTemplateModal()}
              className={`flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors ${
                keepModalOpen ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={keepModalOpen}
            >
              Close
            </button>
            {!isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isAuthenticated) {
                    toast.error('Please log in to add items to your cart');
                    !keepModalOpen && closeTemplateModal();
                    return;
                  }
                  handleAddToOrders(selectedTemplate, e);
                  !keepModalOpen && closeTemplateModal();
                }}
                disabled={selectedTemplate.status !== 'in_stock' || !isAuthenticated}
                className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  selectedTemplate.status === 'in_stock' && isAuthenticated
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                title={!isAuthenticated ? "Please log in to add to cart" : selectedTemplate.status !== 'in_stock' ? "This item is out of stock" : ""}
              >
                <FaShoppingCart /> Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Edit Template Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Edit Template</h2>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Summer Vibes Design"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={editingTemplate.name ?? ''}
                        onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        placeholder="Describe your design..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        rows={4}
                        value={editingTemplate.description ?? ''}
                        onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={editingTemplate.status ?? 'in_stock'}
                        onChange={e => setEditingTemplate({ 
                          ...editingTemplate, 
                          status: e.target.value as 'in_stock' | 'out_of_stock' 
                        })}
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={editingTemplate.size || ''}
                        onChange={e => setEditingTemplate({ ...editingTemplate, size: e.target.value })}
                        required
                      >
                                        <option value="">Select size</option>
                                        <option value="">XS</option>
                                        <option value="S">S</option>      
                                        <option value="M">M</option>
                                        <option value="L">L</option>
                                        <option value="XL">XL</option>
                                        <option value="XL">XXL</option>
                                        <option value="XL">XXXL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 19.99"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        value={editingTemplate.price ?? ''}
                        onChange={e => setEditingTemplate({ ...editingTemplate, price: e.target.value })}
                        required
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${editingCurrency === 'EUR' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => {
                            setEditingCurrency('EUR');
                            setEditingConvertedPrice('');
                          }}
                        >
                          EUR
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${editingCurrency === 'USD' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => {
                            setEditingCurrency('USD');
                            const price = parseFloat(editingTemplate.price ? editingTemplate.price : '0');
                            setEditingConvertedPrice(price ? (price / 0.93).toFixed(2) : '');
                          }}
                        >
                          USD
                        </button>
                        <button
                          type="button"
                          className={`px-3 py-1 rounded ${editingCurrency === 'TND' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => {
                            setEditingCurrency('TND');
                            const price = parseFloat(editingTemplate.price ? editingTemplate.price : '0');
                            setEditingConvertedPrice(price ? (price * 3.35).toFixed(2) : '');
                          }}
                        >
                          TND
                        </button>
                      </div>
                      {editingCurrency !== 'USD' && editingConvertedPrice && (
                        <div className="mt-1 text-sm text-gray-600">
                          Converted Price: {editingConvertedPrice} {editingCurrency}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Template Image (Optional - leave empty to keep current)</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg cursor-pointer transition-all hover:bg-gray-50">
                          <div className="flex flex-col items-center justify-center pt-7">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="pt-1 text-sm text-gray-600">
                              {editingFile ? editingFile.name : 'Upload new image (optional)'}
                            </p>
                          </div>
                          <input 
                            type="file" 
                            className="opacity-0" 
                            accept="image/*"
                            onChange={e => setEditingFile(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>
                    
                    {editingFile && (
                      <div className="mt-4">
                        <div className="border-4 border-blue-200 rounded-xl p-2 bg-white">
                          <img 
                            src={URL.createObjectURL(editingFile)} 
                            alt="Preview" 
                            className="w-full h-48 object-contain rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeEditModal}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleEditSave}
                        disabled={uploading || !editingTemplate.name || !editingTemplate.description}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-all ${
                          uploading || !editingTemplate.name || !editingTemplate.description
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md'
                        }`}
                      >
                        {uploading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </span>
                        ) : 'Update Template'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;