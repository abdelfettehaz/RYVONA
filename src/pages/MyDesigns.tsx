import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTshirt, FaPaintBrush, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaClock, FaShoppingCart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { Design } from '../types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../hooks/useAuth';

const statusBadgeVariants = {
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  pending: 'bg-amber-100 text-amber-800',
  'under review': 'bg-amber-100 text-amber-800'
};

const StatusBadge = ({ status }: { status?: string }) => {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1';
  const variantClass = statusBadgeVariants[status as keyof typeof statusBadgeVariants] || statusBadgeVariants.pending;
  
  return (
    <span className={`${baseClasses} ${variantClass}`}>
      {status === 'approved' ? <FaCheckCircle /> : 
       status === 'rejected' ? <FaTimesCircle /> : <FaClock />}
      {status === 'approved' ? 'Approved' : 
       status === 'rejected' ? 'Rejected' : 
       status === 'under review' ? 'Under Review' : 'Pending'}
    </span>
  );
};

const SkeletonCard = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="animate-pulse border rounded-2xl p-6 shadow bg-white/50"
  >
    <div className="w-full h-32 bg-gradient-to-r from-gray-100 to-gray-200 mb-4 rounded-xl" />
    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-3/4 mb-3" />
    <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-1/2 mb-3" />
    <div className="h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl w-full" />
  </motion.div>
);

const EmptyState = () => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="text-center py-16 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl border border-blue-100"
  >
    <motion.div 
      animate={{ rotate: [0, 5, -5, 0] }}
      transition={{ repeat: Infinity, repeatType: "mirror", duration: 4 }}
      className="relative inline-block mb-6"
    >
      <FaPaintBrush className="text-indigo-500 text-6xl" />
      <div className="absolute -inset-4 bg-indigo-100 rounded-full opacity-30 -z-10"></div>
    </motion.div>
    <h3 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
      No Designs Yet
    </h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Your creative journey begins here! Design your custom T-shirt in our studio.
    </p>
    <Link 
      to="/design-studio" 
      className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg transition-all duration-300 font-medium hover:scale-105"
    >
      <FaPlus /> Create Your First Design
    </Link>
  </motion.div>
);

const FloatingActionButton = () => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className="fixed bottom-8 right-8 z-50"
  >
    <Link
      to="/design-studio"
      className="flex items-center justify-center w-16 h-16 rounded-full shadow-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white text-2xl hover:shadow-2xl transition-all duration-300"
      title="Create New Design"
    >
      <FaPlus />
    </Link>
  </motion.div>
);

const DesignCard = React.forwardRef<HTMLDivElement, {
  design: Design;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: (design: Design) => void;
  onPreview?: (design: Design) => void;
  onAddToOrders?: (design: Design, event?: React.MouseEvent) => void;
}>(({ design, selectable, selected, onSelect, onDelete, onPreview, onAddToOrders }, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input')) {
      return;
    }
    onAddToOrders?.(design);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className={`relative rounded-2xl shadow-md bg-white overflow-hidden transition-all duration-300 cursor-pointer ${selected ? 'ring-2 ring-indigo-500' : ''}`}
    >
      {selectable && (
        <motion.div 
          animate={{ scale: isHovered || selected ? 1 : 0.8 }}
          className="absolute top-4 left-4 z-10"
        >
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150"
              checked={selected}
              onChange={onSelect}
              title="Select design"
            />
          </label>
        </motion.div>
      )}

      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold z-10 ${
        design.type === 'custom' ? 'bg-blue-100 text-blue-800' : 
        design.type === 'combined' ? 'bg-purple-100 text-purple-800' : 
        'bg-green-100 text-green-800'
      }`}>
        {design.type === 'custom' ? 'Custom' : design.type === 'combined' ? 'Combined' : 'Order'}
      </div>

      {design.type === 'combined' && Array.isArray(design.source_designs) && design.source_designs.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 p-4">
          {design.source_designs.map((src, idx) => {
            const imgSrc = (src as any).image || (src as any).filename || '';
            const side = (src as any).side;
            return (
              <div key={idx} className="relative aspect-square">
                <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={`Combined design ${idx + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-110"
                    onError={e => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Design' }}
                  />
                </div>
                {side && (
                  <span className="absolute top-1 left-1 bg-white/90 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                    {String(side).charAt(0).toUpperCase() + String(side).slice(1)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 p-4">
          {(['front', 'back', 'left', 'right'] as const).map(side => {
            const designKey = `${side}_design` as keyof Design;
            const image = design[designKey] as string;
            if (!image) return null;
            return (
              <div key={side} className="relative aspect-square">
                <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${side} design`}
                    className="w-full h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-110"
                    onClick={() => onPreview?.(design)}
                    onError={e => { e.currentTarget.src = 'https://via.placeholder.com/150?text=Design' }}
                  />
                </div>
                <span className="absolute top-1 left-1 bg-white/90 px-2 py-0.5 rounded-full text-xs font-semibold shadow-sm">
                  {side.charAt(0).toUpperCase() + side.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 border-t border-gray-100">
        <h5 className="text-lg font-bold text-gray-800 mb-2 truncate">
          {`Design #${design.id}`}
        </h5>
        
        <div className="flex justify-between items-center mb-3">
          <StatusBadge status={design.status} />
          <span className="text-gray-500 text-xs">
            {new Date(design.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Price:</span>
          <span className="font-bold text-indigo-600 text-lg">
            {design.type === 'custom' ? '€15.00' : `€${design.total_price?.toFixed(2) || '0.00'}`}
          </span>
        </div>
      </div>

      {/* Enhanced Action Buttons */}
      <div className="flex gap-2 p-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 relative overflow-hidden group"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) {
              if (window.confirm(`Are you sure you want to delete Design #${design.id}? This action cannot be undone.`)) {
                onDelete(design);
              }
            } else if (onSelect) {
              onSelect();
            }
          }}
          title="Delete this design"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 blur-md"></span>
          <span className="relative z-10 flex items-center gap-2">
            <FaTrash className="text-lg" />
            <span>Delete</span>
          </span>
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03] hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 relative overflow-hidden group"
          onClick={(e) => onAddToOrders?.(design, e)}
          title="Add to Cart"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 blur-md"></span>
          <span className="relative z-10 flex items-center gap-2">
            <FaShoppingCart className="text-lg" />
            <span>Add to Cart</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
});

const MyDesigns: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Authentication Required</h2>
        <p className="text-gray-600 mb-6">You must be logged in to view your designs.</p>
        <Link to="/login" className="btn btn-primary bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800">Go to Login</Link>
      </div>
    );
  }
  
  if (user?.role === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Admins do not have personal designs.</h2>
        <p className="text-gray-600 mb-6">Go to the Admin Dashboard to manage all user designs.</p>
        <Link to="/admin-dashboard" className="btn btn-primary bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800">Go to Admin Dashboard</Link>
      </div>
    );
  }

  const [designs, setDesigns] = useState<Design[]>([]);
  const [selectedCustom, setSelectedCustom] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [combining, setCombining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const response = await apiService.getDesigns();
      if (response.success && response.data) {
        setDesigns(response.data);
      } else {
        setError(response.message || 'Failed to load designs');
      }
    } catch (err) {
      setError('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const filteredDesigns = designs.filter(
    d => d.front_design || d.back_design || d.left_design || d.right_design || d.design_path
  );

  const customDesigns = filteredDesigns.filter(d => d.type === 'custom');

  const toggleCustomSelection = (designId: number) => {
    setSelectedCustom(prev =>
      prev.includes(designId) ? prev.filter(id => id !== designId) : [...prev, designId]
    );
  };

  const canCombine = selectedCustom.length >= 2;

  const combineDesigns = async () => {
    if (!canCombine) {
      toast.error('Please select at least 2 custom designs to combine');
      return;
    }
    setCombining(true);
    try {
      const sides = ['front', 'back', 'left', 'right'];
      const designIdsMap: Record<string, number> = {};
      selectedCustom.slice(0, 4).forEach((id, idx) => {
        designIdsMap[sides[idx]] = id;
      });
      const response = await apiService.createCombinedDesign(designIdsMap);
      if (response.success && response.data) {
        toast.success('Designs combined successfully!');
        setDesigns(prev => [response.data!.design, ...prev]);
        setSelectedCustom([]);
      } else {
        await fetchDesigns();
      }
    } catch (err) {
      await fetchDesigns();
    } finally {
      setCombining(false);
    }
  };

  const handleDeleteCustom = async () => {
    if (selectedCustom.length === 0) return;
    
    // Show loading state
    const loadingToast = toast.loading(`Deleting ${selectedCustom.length} design${selectedCustom.length > 1 ? 's' : ''}...`);
    
    try {
      console.log('Attempting to delete designs:', selectedCustom);
      
              const results = await Promise.all(
          selectedCustom.map(async (id) => {
            try {
              console.log(`Deleting design ID: ${id}`);
              const result = await apiService.deleteDesign(id);
              console.log(`Delete result for ID ${id}:`, result);
              return { 
                id, 
                success: result.success, 
                message: result.message,
                deleted_orders: (result as any).deleted_orders || 0
              };
            } catch (error) {
              console.error(`Error deleting design ID ${id}:`, error);
              return { 
                id, 
                success: false, 
                message: error instanceof Error ? error.message : 'Unknown error',
                deleted_orders: 0
              };
            }
          })
        );
      
      console.log('All delete results:', results);
      
      const successfulDeletes = results.filter(r => r.success);
      const failedDeletes = results.filter(r => !r.success);
      
      // Update the designs state to remove successfully deleted designs
      setDesigns(prev => prev.filter(d => !successfulDeletes.some(r => r.id === d.id)));
      setSelectedCustom([]);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show appropriate success/error messages
      if (successfulDeletes.length > 0 && failedDeletes.length === 0) {
        // Count total deleted orders
        const totalDeletedOrders = results.reduce((total, result) => {
          return total + (result.success && result.deleted_orders ? result.deleted_orders : 0);
        }, 0);
        
        const message = totalDeletedOrders > 0 
          ? `Successfully deleted ${successfulDeletes.length} design${successfulDeletes.length > 1 ? 's' : ''}! Also removed ${totalDeletedOrders} related order(s) from My Orders.`
          : `Successfully deleted ${successfulDeletes.length} design${successfulDeletes.length > 1 ? 's' : ''}!`;
        
        toast.success(message);
      } else if (successfulDeletes.length > 0 && failedDeletes.length > 0) {
        // Count total deleted orders
        const totalDeletedOrders = results.reduce((total, result) => {
          return total + (result.success && result.deleted_orders ? result.deleted_orders : 0);
        }, 0);
        
        const message = totalDeletedOrders > 0 
          ? `Deleted ${successfulDeletes.length} design${successfulDeletes.length > 1 ? 's' : ''}, but failed to delete ${failedDeletes.length} design${failedDeletes.length > 1 ? 's' : ''}. Also removed ${totalDeletedOrders} related order(s) from My Orders.`
          : `Deleted ${successfulDeletes.length} design${successfulDeletes.length > 1 ? 's' : ''}, but failed to delete ${failedDeletes.length} design${failedDeletes.length > 1 ? 's' : ''}.`;
        
        toast.warning(message);
        failedDeletes.forEach(fail => {
          console.error(`Failed to delete design ${fail.id}: ${fail.message}`);
        });
      } else {
        toast.error(`Failed to delete any designs. Please try again.`);
        failedDeletes.forEach(fail => {
          console.error(`Failed to delete design ${fail.id}: ${fail.message}`);
        });
      }
      
    } catch (err) {
      console.error('Error in handleDeleteCustom:', err);
      toast.dismiss(loadingToast);
      toast.error('Failed to delete selected designs. Please try again.');
    }
  };

  const handleDeleteIndividual = async (design: Design) => {
    const loadingToast = toast.loading(`Deleting Design #${design.id}...`);
    
    try {
      console.log(`Attempting to delete individual design:`, design);
      
      const result = await apiService.deleteDesign(design.id);
      console.log(`Delete result for design ${design.id}:`, result);
      
      if (result.success) {
        setDesigns(prev => prev.filter(d => d.id !== design.id));
        toast.dismiss(loadingToast);
        
        // Show success message with order deletion info
        const message = (result as any).deleted_orders > 0
          ? `Design #${design.id} deleted successfully! Also removed ${(result as any).deleted_orders} related order(s) from My Orders.`
          : `Design #${design.id} deleted successfully!`;
        
        toast.success(message);
      } else {
        toast.dismiss(loadingToast);
        toast.error(result.message || `Failed to delete Design #${design.id}`);
      }
      
    } catch (error) {
      console.error(`Error deleting design ${design.id}:`, error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to delete Design #${design.id}. Please try again.`);
    }
  };

  const handleAddToOrders = async (design: Design, event?: React.MouseEvent) => {
    try {
      console.log('Adding design to orders:', design);
      
      let designCardElement: HTMLElement | null = null;
      
      if (event) {
        const button = event.currentTarget as HTMLElement;
        designCardElement = button.closest('.relative.rounded-2xl.shadow-md.bg-white.overflow-hidden') as HTMLElement;
      }
      
      let designCardHtml = '';
      if (designCardElement) {
        designCardHtml = designCardElement.outerHTML;
        console.log('Captured design card HTML:', designCardHtml);
      }
      
      const enhancedData = {
        design_id: design.id,
        design_image: design.front_design || design.design_path || 'default.png',
        design_card_html: designCardHtml,
        design_data: {
          id: design.id,
          front_design: design.front_design,
          back_design: design.back_design,
          left_design: design.left_design,
          right_design: design.right_design,
          design_path: design.design_path,
          type: design.type,
          status: design.status,
          created_at: design.created_at,
          size: (design as any).size || 'M' // Pass the size along (though backend will fetch from DB)
        }
      };

      console.log('Sending enhanced data:', enhancedData);

      const response = await fetch('/api/simple-add-to-orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify(enhancedData)
      });

      const result = await response.json();
      console.log('Enhanced API response:', result);
      
      if (result.success) {
        toast.success(`Design #${design.id} (Size: ${result.size}) saved to My Orders!`);
      } else {
        toast.error(result.message || 'Failed to save design');
      }
    } catch (err) {
      console.error('Error adding to orders:', err);
      toast.error('Failed to save design to orders');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 pb-20 font-sans mt-24">
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
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl shadow-xl mb-12 bg-gradient-to-br from-indigo-900 to-purple-800 text-white"
      >
        <div className="absolute inset-0 opacity-10 pattern-dots pattern-indigo-500 pattern-bg-transparent pattern-size-6 pattern-opacity-20"></div>
        <div className="relative z-10 py-16 px-8 text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, repeatType: "mirror", duration: 6 }}
            className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg"
          >
            <FaTshirt className="text-white text-4xl" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">My Designs</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            {selectedCustom.length > 0 
              ? `${selectedCustom.length} custom design${selectedCustom.length > 1 ? 's' : ''} selected for combining` 
              : 'Create, combine, and manage your custom Ryvonas'}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                to="/design-studio" 
                className="px-6 py-3 bg-white text-indigo-800 font-medium rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md flex items-center gap-2"
              >
                <FaPlus /> New Design
              </Link>
            </motion.div>
            {selectedCustom.length > 0 && (
              <motion.div 
                whileHover={{ scale: canCombine ? 1.05 : 1 }}
                whileTap={{ scale: canCombine ? 0.95 : 1 }}
              >
                <button
                  onClick={combineDesigns}
                  disabled={!canCombine || combining}
                  className={`px-6 py-3 font-medium rounded-full transition-all duration-300 flex items-center gap-2 shadow-md ${
                    canCombine 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:shadow-lg' 
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {combining ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Combining...
                    </span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Combine Selected
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r"
        >
          <p>{error}</p>
        </motion.div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredDesigns.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Custom Designs Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Custom Designs</h2>
              {selectedCustom.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${selectedCustom.length} selected design${selectedCustom.length > 1 ? 's' : ''}? This action cannot be undone.`)) {
                        handleDeleteCustom();
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 text-sm font-medium flex items-center gap-2 shadow-md"
                  >
                    <FaTrash /> Delete Selected ({selectedCustom.length})
                  </button>
                </motion.div>
              )}
            </div>
            
            {customDesigns.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center"
              >
                <p className="text-gray-600 mb-4">You haven't created any custom designs yet.</p>
                <Link 
                  to="/design-studio" 
                  className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300 shadow-md"
                >
                  <FaPaintBrush /> Start Designing
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in mb-12">
                <AnimatePresence>
                  {customDesigns.map(design => (
                    <DesignCard 
                      key={design.id} 
                      design={design} 
                      selectable={true} 
                      selected={selectedCustom.includes(design.id)} 
                      onSelect={() => toggleCustomSelection(design.id)}
                      onDelete={handleDeleteIndividual}
                      onAddToOrders={handleAddToOrders}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.section>
        </>
      )}
      
      <FloatingActionButton />
    </div>
  );
};

export default MyDesigns;