import React from 'react';

interface DesignCardProps {
  design: any;
  selected: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onPayNow: (id: number) => void;
  onAddToCart: (id: number) => void;
  loading?: boolean;
}

const DesignCard: React.FC<DesignCardProps> = ({
  design, selected, onDelete, onAddToCart, loading
}) => (
  <div
    className={`relative border rounded-lg p-4 shadow-sm transition-all ${
      selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'
    }`}
    aria-selected={selected}
    tabIndex={0}
  >
    <img
      src={design.design_path || design.image_path}
      alt={`Preview of design ${design.id}`}
      className="w-full h-40 object-contain mb-2 rounded"
      loading="lazy"
    />
    {design.type === 'custom' && (
      <div className="flex flex-col gap-2">
        <button
          className="w-full py-1 rounded bg-red-500 text-white hover:bg-red-600"
          onClick={() => onDelete(design.id)}
          disabled={loading}
          aria-label="Delete design"
        >{loading ? 'Deleting...' : 'Delete'}</button>
        <button
          className="w-full py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
          onClick={() => onAddToCart(design.id)}
          disabled={loading}
          aria-label="Add to My Orders"
        >Add to My Orders</button>
      </div>
    )}
  </div>
);

export default DesignCard; 