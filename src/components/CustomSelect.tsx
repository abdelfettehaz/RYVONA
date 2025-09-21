import { useState } from 'react';

interface CustomSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const CustomSelect = ({
  options,
  value,
  onChange,
  label,
  className = ''
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`mb-6 relative ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-purple-200 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Current selection display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-black/30 border border-white/10 rounded-md px-3 py-2 text-sm text-white text-left flex justify-between items-center hover:bg-black/40 transition-colors"
        >
          <span>{value}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown options */}
        {isOpen && (
          <div
            className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-black/90 border border-white/10 rounded-md shadow-lg"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#7c3aed #4b5563',
            }}
          >
            {options.map(option => (
              <button
                key={option}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  value === option
                    ? 'bg-purple-600 text-white'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};