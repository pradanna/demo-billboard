import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getBillboards, getAllCities } from '../../lib/mockData';
import { Billboard, TimeFilter } from '../../types';
import { FilterDate } from '../../components/shared/FilterDate';
import { ExportButton } from '../../components/shared/ExportButton';
import { BillboardDrawer } from '../../components/shared/BillboardDrawer';
import { BillboardMap } from './components/BillboardMap';
import { KPISection } from './components/KPISection';
import { BillboardQuickExplorer } from './components/BillboardQuickExplorer';
import { 
  Map, 
  MapPin, 
  Layers, 
  Maximize2, 
  LayoutList, 
  Compass, 
  ArrowRight
} from 'lucide-react';

interface LayoutContext {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
}

export const DashboardPage: React.FC = () => {
  const { selectedCity, setSelectedCity } = useOutletContext<LayoutContext>();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('mingguan');
  const [selectedBillboard, setSelectedBillboard] = useState<Billboard | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'full'>('split');

  // Filter billboards by city
  const billboards = getBillboards({ kota: selectedCity });
  const allCities = ['Semua', ...getAllCities()];

  const handleSelectBillboard = (billboard: Billboard) => {
    setSelectedBillboard(billboard);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Compass className="w-3.5 h-3.5 text-blue-600" />
              OOH Traffic Intelligence
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Live Demo Proof-of-Concept</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Sebaran Billboard & Trafik Nasional
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring trafik real-time simulasi, kepadatan demografi, dan potensi impresi OOH di seluruh Indonesia.
          </p>
        </div>

        {/* Global Time Filter Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-right hidden xl:block">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Periode Analisis</div>
            <div className="text-xs font-bold text-slate-700">
              {timeFilter === 'harian' ? 'Harian (24 Jam)' : timeFilter === 'mingguan' ? '7 Hari Terakhir' : '30 Hari Terakhir'}
            </div>
          </div>
          <FilterDate value={timeFilter} onChange={setTimeFilter} />
          <ExportButton 
            city={selectedCity} 
            timeFilter={timeFilter === 'bulanan' ? 'bulanan' : timeFilter === 'harian' ? 'harian' : 'mingguan'} 
          />
        </div>
      </div>

      {/* Quick City Filter Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold whitespace-nowrap pl-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          Fokus Wilayah:
        </span>
        {allCities.map((city) => {
          const isActive = selectedCity === city;
          return (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {city === 'Semua' ? '🇮🇩 Seluruh Indonesia' : city}
            </button>
          );
        })}
      </div>

      {/* KPI Section */}
      <KPISection billboards={billboards} timeFilter={timeFilter} />

      {/* Interactive Map Section */}
      <div className="space-y-3">
        {/* Map Header with View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              <Map className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Peta Google Maps Sebaran Billboard & Marker Clustering
              </h3>
              <p className="text-[11px] text-slate-500">
                Peta interaktif Google Maps (tanpa API key) dengan pengelompokan titik (cluster) dan indikator warna intensitas trafik.
              </p>
            </div>
          </div>

          {/* View Mode Toggle (Split Map + Explorer vs Full Map) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'split'
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Peta & Daftar Explorer"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Peta + Daftar</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('full')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  viewMode === 'full'
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Peta Lebar Penuh"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Peta Penuh</span>
              </button>
            </div>

            <Link
              to="/billboard"
              className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>Semua Tabel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Map & Quick Explorer Grid */}
        <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {/* Main Leaflet Map View */}
          <div className={viewMode === 'split' ? 'lg:col-span-2' : 'col-span-1'}>
            <BillboardMap
              billboards={billboards}
              selectedBillboard={selectedBillboard}
              onSelectBillboard={handleSelectBillboard}
              selectedCity={selectedCity}
              className="h-[520px] w-full"
            />
          </div>

          {/* Quick Explorer Panel (When split view is active) */}
          {viewMode === 'split' && (
            <div className="lg:col-span-1 h-[520px]">
              <BillboardQuickExplorer
                billboards={billboards}
                selectedBillboard={selectedBillboard}
                onSelectBillboard={handleSelectBillboard}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <BillboardDrawer
        billboard={selectedBillboard}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />

    </div>
  );
};