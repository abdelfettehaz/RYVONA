import React from 'react';

interface PricingSummaryProps {
  count: number;
  total: number;
  savings: number;
}

const PricingSummary: React.FC<PricingSummaryProps> = ({ count, total, savings }) => (
  <div className="p-4 bg-blue-100 rounded-lg mb-4 text-center">
    <div className="text-lg font-semibold">Combined Order: {count} T-shirts</div>
    <div className="text-xl font-bold mt-2">Total: €{total.toFixed(2)}</div>
    {savings > 0 && (
      <div className="text-green-700 mt-1">You save €{savings.toFixed(2)}!</div>
    )}
  </div>
);

export default PricingSummary; 