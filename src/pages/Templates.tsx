import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface TShirtTemplate {
  id: number;
  name: string;
  description: string;
  image_url: string;
  status: 'in_stock' | 'out_of_stock';
}


const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TShirtTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<TShirtTemplate>>({
    name: '',
    description: '',
    status: 'in_stock'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const templatesBoxRef = useRef<HTMLDivElement | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TShirtTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tempRes = await apiService.getTemplates();
        setTemplates((tempRes.data as unknown as TShirtTemplate[]) || []);
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);



  const handleUploadClick = () => {
    setShowUpload(true);
    setNewTemplate({ name: '', description: '', status: 'in_stock' });
  };

  const handleUpload = async () => {
    if (!selectedFile || !newTemplate.name || !newTemplate.description) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      Object.entries(newTemplate).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, String(value));
      });
      
      await apiService.uploadTemplate(formData);
      const tempRes = await apiService.getTemplates();
      setTemplates((tempRes.data as unknown as TShirtTemplate[]) || []);
      
      setNewTemplate({
        name: '',
        description: '',
        status: 'in_stock'
      });
      setSelectedFile(null);
      setShowUpload(false);
      setTimeout(() => {
        templatesBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } catch (e) {
      console.error('Upload failed:', e);
    } finally {
      setUploading(false);
    }
  };

  const toggleStockStatus = async (templateId: number, currentStatus: 'in_stock' | 'out_of_stock') => {
    try {
      const newStatus = currentStatus === 'in_stock' ? 'out_of_stock' : 'in_stock';
      await apiService.updateTemplateStatus(templateId, { status: newStatus });
      
      setTemplates(templates.map(t => 
        t.id === templateId ? { ...t, status: newStatus } : t
      ));
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleTemplateClick = (template: TShirtTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      await apiService.deleteTemplate(templateId);
      // Remove the template from the local state
      setTemplates(templates.filter(t => t.id !== templateId));
    } catch (e) {
      console.error('Failed to delete template:', e);
      alert('Failed to delete template. Please try again.');
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">T-Shirt Templates</h1>
            <p className="text-gray-600">Browse our collection of custom Ryvonas</p>
          </div>
          
          {isAdmin && (
            <button
              onClick={handleUploadClick}
              className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 shadow-md transition-all transform hover:scale-105"
            >
              + Upload New Template
            </button>
          )}
        </div>

        {/* Search and Upload Section */}
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
              {[...filteredTemplates].reverse().map(template => (
                <div 
                  key={template.id} 
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
                      className="text-gray-600 mb-4 line-clamp-2 cursor-pointer"
                      onClick={() => handleTemplateClick(template)}
                    >
                      {template.description}
                    </p>
                    
                                         <div className="flex justify-between items-center">
                       <button
                         onClick={() => handleTemplateClick(template)}
                         className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                       >
                         View Details
                       </button>
                       
                       {isAdmin && (
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             if (window.confirm(`Are you sure you want to delete "${template.name}"? This action cannot be undone.`)) {
                               handleDeleteTemplate(template.id);
                             }
                           }}
                           className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                         >
                           Delete
                         </button>
                       )}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Detail Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">{selectedTemplate.name}</h2>
              <button
                onClick={closeTemplateModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
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
                  <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                    {selectedTemplate.description}
                  </p>
                </div>

                                 {/* Action Buttons */}
                 <div className="mt-6 flex gap-4 pt-4 border-t">
                   <button
                     onClick={closeTemplateModal}
                     className="flex-1 px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                   >
                     Close
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesPage;