import React, { useState } from 'react';
import { Billboard } from '../../../types';
import { Search, MapPin, ChevronRight, Eye } from 'lucide-react';
import { TrafficBadge } from '../../../components/shared/TrafficBadge';

interface BillboardQuickExplorerProps {
  billboards: Billboard[];
  selectedBillboard: Billboard | null;
  onSelectBillboard: (billboard: Billboard) => void;
  className?: string;
}

export const BillboardQuickExplorer: React.FC<BillboardQuickExplorerProps> = ({
  billboards,
  selectedBillboard,
  onSelectBillboard,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = billboards.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.nama.toLowerCase().includes(q) ||
      b.alamat.toLowerCase().includes(q) ||
      b.kota.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full ${className}`}>
      {/* Header with Search */}
      <div className="p-4 border-b border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Eksplorasi Titik Billboard</h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {filtered.length} Titik
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama jalan, spot, ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Billboard Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[460px]">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Tidak ada titik billboard yang cocok dengan "{searchQuery}"
          </div>
        ) : (
          filtered.map((b) => {
            const isSelected = selectedBillboard?.id === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBillboard(b)}
                className={`w-full p-3.5 text-left flex items-start justify-between gap-3 transition-colors ${
                  isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {b.id}
                    </span>
                    <TrafficBadge level={b.levelTraffic} />
                    <span className="text-[11px] text-slate-400 truncate">• {b.kota}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{b.nama}</h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">📍 {b.alamat}</p>
                </div>

                <div className="shrink-0 flex items-center pt-1 text-slate-400">
                  <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-blue-600' : ''}`} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};