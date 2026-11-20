import React, { useState } from 'react';
import { FilterDate } from '../../components/shared/FilterDate';
import { TimeFilter } from '../../types';
import { BillboardComparison } from './components/BillboardComparison';
import { CityComparison } from './components/CityComparison';
import { 
  Layers, 
  Building2, 
  ArrowLeftRight,
  Sparkles,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ComparePage: React.FC = () => {
  const [compareMode, setCompareMode] = useState<'billboard' | 'city'>('billboard');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('mingguan');

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3" /> Agent 3: Perbandingan
            </span>
            <span className="text-xs text-slate-400">• Multi-Entity Comparison</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Perbandingan Antar Billboard & Wilayah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi side-by-side performa volume traffic (OTS), kategori moda kendaraan, dan profil demografi
          </p>
        </div>

        {/* Global Time Filter Controls & Export Link */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <FilterDate value={timeFilter} onChange={setTimeFilter} />
          
          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors shadow-2xs"
            title="Export laporan perbandingan ke PDF/Excel"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Export ke Laporan</span>
          </Link>
        </div>
      </div>

      {/* Mode Switcher Tabs (Billboard vs Wilayah) */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setCompareMode('billboard')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              compareMode === 'billboard'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Perbandingan Antar Titik Billboard (2-4 Titik)</span>
          </button>

          <button
            onClick={() => setCompareMode('city')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              compareMode === 'city'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Perbandingan Agregat Wilayah / Kota</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 px-3 hidden lg:flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Mode aktif: <strong>{compareMode === 'billboard' ? 'Titik Spesifik' : 'Agregat Kota'}</strong></span>
        </div>
      </div>

      {/* Active Mode Render */}
      {compareMode === 'billboard' ? (
        <BillboardComparison timeFilter={timeFilter} />
      ) : (
        <CityComparison timeFilter={timeFilter} />
      )}

    </div>
  );
};
