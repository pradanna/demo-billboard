import React from 'react';
import { TrafficLevel } from '../../types';

interface TrafficBadgeProps {
  level: TrafficLevel;
  className?: string;
}

export const TrafficBadge: React.FC<TrafficBadgeProps> = ({ level, className = '' }) => {
  switch (level) {
    case 'tinggi':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
          Trafik Tinggi
        </span>
      );
    case 'sedang':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Trafik Sedang
        </span>
      );
    case 'rendah':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          Trafik Rendah
        </span>
      );
  }
};
