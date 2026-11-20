import React, { useState } from 'react';
import { Billboard, TimeFilter } from '../../../types';
import { getBillboards } from '../../../lib/mockData';
import { Card } from '../../../components/shared/Card';
import { TrafficBadge } from '../../../components/shared/TrafficBadge';
import { 
  getBillboardCompareData, 
  COMPARE_COLORS, 
  getDaysCountFromFilter,
  BillboardCompareData 
} from '../utils/compareCalculations';
import { CompareTrendChart } from './CompareTrendChart';
import { CompareCategoryBarChart } from './CompareCategoryBarChart';
import { CompareDemographicsChart } from './CompareDemographicsChart';
import { ComparisonMetricsTable } from './ComparisonMetricsTable';
import { ComparisonInsights } from './ComparisonInsights';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Layers, 
  Sparkles,
  Bike,
  Car,
  Footprints,
  Truck,
  ArrowUpDown
} from 'lucide-react';

interface BillboardComparisonProps {
  timeFilter: TimeFilter;
}

export const BillboardComparison: React.FC<BillboardComparisonProps> = ({ timeFilter }) => {
  const allBillboards = getBillboards();
  const daysCount = getDaysCountFromFilter(timeFilter);

  // Default selected billboards: Bundaran HI (BB-001) and Sudirman SCBD (BB-002)
  const [selectedIds, setSelectedIds] = useState<string[]>([
    allBillboards[0]?.id || 'BB-001',
    allBillboards[1]?.id || 'BB-002',
  ]);

  const [activeChartTab, setActiveChartTab] = useState<'trend' | 'category' | 'demographics'>('trend');

  // Handle changing an existing slot
  const handleSelectChange = (index: number, newId: string) => {
    const updated = [...selectedIds];
    updated[index] = newId;
    setSelectedIds(updated);
  };

  // Add billboard slot (up to 4)
  const handleAddSlot = () => {
    if (selectedIds.length >= 4) return;
    // Find next unselected billboard
    const unselected = allBillboards.find((b) => !selectedIds.includes(b.id));
    if (unselected) {
      setSelectedIds([...selectedIds, unselected.id]);
    }
  };

  // Remove billboard slot (down to 2)
  const handleRemoveSlot = (index: number) => {
    if (selectedIds.length <= 2) return;
    const updated = selectedIds.filter((_, i) => i !== index);
    setSelectedIds(updated);
  };

  // Apply quick presets
  const applyPreset = (presetIds: string[]) => {
    setSelectedIds(presetIds);
  };

  // Gather calculated data for each selected billboard
  const compareDataList: BillboardCompareData[] = selectedIds
    .map((id) => getBillboardCompareData(id, daysCount))
    .filter((d): d is BillboardCompareData => d !== null);

  // Helper for responsive grid column classes based on count
  const getGridColsClass = (count: number) => {
    switch (count) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selection Control Panel */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pilih Titik Billboard untuk Dibandingkan
            </h3>
            <p className="text-xs text-slate-500">
              Bandingkan 2 hingga 4 titik billboard secara komprehensif
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Preset:
            </span>
            <button
              onClick={() => applyPreset(['BB-001', 'BB-002'])}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors"
            >
              Jakarta Flagship
            </button>
            <button
              onClick={() => applyPreset(['BB-001', 'BB-009'])}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors"
            >
              Jakarta vs Surabaya
            </button>
            <button
              onClick={() => applyPreset(['BB-020', 'BB-015', 'BB-034'])}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors"
            >
              Bali vs Bandung vs Jogja
            </button>
          </div>
        </div>

        {/* Dynamic Selectors Grid */}
        <div className={`grid ${getGridColsClass(selectedIds.length)} gap-4`}>
          {selectedIds.map((id, index) => {
            const colorTheme = COMPARE_COLORS[index % COMPARE_COLORS.length];
            const currentBb = allBillboards.find((b) => b.id === id);

            return (
              <div
                key={index}
                className={`p-3.5 rounded-xl border-2 ${colorTheme.border} ${colorTheme.bg} transition-all space-y-2 relative`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colorTheme.badge}`}>
                    Titik {String.fromCharCode(65 + index)}
                  </span>

                  {selectedIds.length > 2 && (
                    <button
                      onClick={() => handleRemoveSlot(index)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Hapus slot perbandingan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={id}
                  onChange={(e) => handleSelectChange(index, e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  {allBillboards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.id} — {b.nama}
                    </option>
                  ))}
                </select>

                {currentBb && (
                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                    <span className="font-medium text-slate-700">{currentBb.tipe}</span>
                    <TrafficBadge level={currentBb.levelTraffic} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Billboard Slot Button */}
        {selectedIds.length < 4 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleAddSlot}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-lg transition-colors border border-blue-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Titik Billboard (Maks 4)
            </button>
          </div>
        )}
      </Card>

      {/* Side-by-Side Quick Summary Metric Cards */}
      <div className={`grid ${getGridColsClass(compareDataList.length)} gap-4`}>
        {compareDataList.map((item, index) => {
          const colorTheme = COMPARE_COLORS[index % COMPARE_COLORS.length];
          return (
            <Card key={item.billboard.id} className="relative overflow-hidden p-5">
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${colorTheme.badge}`} />
              
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {item.billboard.id}
                  </span>
                  <h4 className="text-base font-extrabold text-slate-900 line-clamp-1 mt-0.5">
                    {item.billboard.nama}
                  </h4>
                  <div className="text-xs text-slate-500">{item.billboard.kota}</div>
                </div>
                <TrafficBadge level={item.billboard.levelTraffic} />
              </div>

              {/* Total OTS Metric */}
              <div className="my-3 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Estimasi OTS ({daysCount} Hari)
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {(item.totalTraffic / 1_000_000).toFixed(2)}M{' '}
                  <span className="text-xs font-semibold text-slate-500">impresi</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Rata-rata: <strong className="text-slate-800">{(item.avgDailyTraffic / 1_000).toFixed(0)}k</strong> / hari
                </div>
              </div>

              {/* Quick Vehicle Share Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Bike className="w-3.5 h-3.5 text-emerald-600" /> Motor:
                  </span>
                  <span className="font-bold text-slate-800 font-mono">{item.percentMotor}%</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Car className="w-3.5 h-3.5 text-blue-600" /> Mobil:
                  </span>
                  <span className="font-bold text-slate-800 font-mono">{item.percentMobil}%</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Footprints className="w-3.5 h-3.5 text-amber-600" /> Pejalan:
                  </span>
                  <span className="font-bold text-slate-800 font-mono">{item.percentPejalanKaki}%</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Visual Comparison Charts Container with Tabs */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Visualisasi Grafik Perbandingan Side-by-Side
              </h3>
              <p className="text-xs text-slate-500">
                Analisis perbandingan tren harian, breakdown moda, dan profil demografi
              </p>
            </div>
          </div>

          {/* Chart View Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveChartTab('trend')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeChartTab === 'trend'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Tren Harian
            </button>
            <button
              onClick={() => setActiveChartTab('category')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeChartTab === 'category'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Kategori Moda
            </button>
            <button
              onClick={() => setActiveChartTab('demographics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeChartTab === 'demographics'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Demografi Usia
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeChartTab === 'trend' && (
          <CompareTrendChart billboardsData={compareDataList} />
        )}
        {activeChartTab === 'category' && (
          <CompareCategoryBarChart billboardsData={compareDataList} />
        )}
        {activeChartTab === 'demographics' && (
          <CompareDemographicsChart billboardsData={compareDataList} />
        )}
      </Card>

      {/* Side-by-Side Detailed Matrix Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Matriks Komparasi Lengkap (Side-by-Side)
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi komprehensif performa traffic, catchment area, dan profil audiens
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {selectedIds.join(' vs ')}
          </span>
        </div>

        <ComparisonMetricsTable
          billboardsData={compareDataList}
          daysCount={daysCount}
        />
      </Card>

      {/* Strategic AI Insights Card */}
      <ComparisonInsights
        billboardsData={compareDataList}
        daysCount={daysCount}
      />

    </div>
  );
};
