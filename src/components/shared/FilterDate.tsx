import React from 'react';
import { Calendar } from 'lucide-react';
import { TimeFilter } from '../../types';

interface FilterDateProps {
  value: TimeFilter;
  onChange: (val: TimeFilter) => void;
  className?: string;
}

export const FilterDate: React.FC<FilterDateProps> = ({ value, onChange, className = '' }) => {
  const options: { label: string; value: TimeFilter }[] = [
    { label: 'Harian', value: 'harian' },
    { label: '7 Hari', value: 'mingguan' },
    { label: '30 Hari', value: 'bulanan' },
    { label: 'Custom', value: 'custom' },
  ];

  return (
    <div className={`flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 text-xs ${className}`}>
      <span className="pl-2 pr-1 text-slate-400 hidden sm:inline-flex items-center">
        <Calendar className="w-3.5 h-3.5" />
      </span>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-full font-semibold transition-all ${
            value === opt.value
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
