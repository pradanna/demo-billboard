import React, { useState, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getBillboards, getAllCities, getTrafficByBillboard } from '../../lib/mockData';
import { Card } from '../../components/shared/Card';
import { TrafficBadge } from '../../components/shared/TrafficBadge';
import { BillboardDrawer } from '../../components/shared/BillboardDrawer';
import { ExportButton } from '../../components/shared/ExportButton';
import { TrafficLevel, Billboard } from '../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Eye,
  ArrowRight,
  MapPin,
  Maximize2,
  Bike,
  Car,
  Footprints,
  Truck,
  RotateCcw,
  Layers
} from 'lucide-react';

interface LayoutContext {
  selectedCity: string;
  setSelectedCity?: (city: string) => void;
}

type SortField = 'traffic-desc' | 'traffic-asc' | 'name-asc' | 'name-desc' | 'id-asc' | 'city-asc';
type ViewMode = 'table' | 'grid';

export const BillboardListPage: React.FC = () => {
  const { selectedCity, setSelectedCity } = useOutletContext<LayoutContext>();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [localCity, setLocalCity] = useState<string>(selectedCity || 'Semua');
  const [levelFilter, setLevelFilter] = useState<TrafficLevel | 'semua'>('semua');
  const [typeFilter, setTypeFilter] = useState<string>('semua');
  const [sortBy, setSortBy] = useState<SortField>('traffic-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Drawer state
  const [drawerBillboard, setDrawerBillboard] = useState<Billboard | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sync if layout selectedCity changes
  React.useEffect(() => {
    if (selectedCity && selectedCity !== localCity) {
      setLocalCity(selectedCity);
    }
  }, [selectedCity]);

  const allCities = ['Semua', ...getAllCities()];
  const allTypes = ['semua', '3D Curved DOOH', 'DOOH / LED Digital', 'Megatron', 'Static Vinyl'];

  // Handler to open drawer
  const handleOpenDrawer = (billboard: Billboard) => {
    setDrawerBillboard(billboard);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setLocalCity('Semua');
    if (setSelectedCity) setSelectedCity('Semua');
    setLevelFilter('semua');
    setTypeFilter('semua');
    setSortBy('traffic-desc');
  };

  // Filtered & Sorted Billboards
  const filteredBillboards = useMemo(() => {
    let list = getBillboards({
      kota: localCity === 'Semua' ? undefined : localCity,
      level: levelFilter === 'semua' ? undefined : levelFilter
    });

    // Filter by type
    if (typeFilter !== 'semua') {
      list = list.filter(b => b.tipe === typeFilter);
    }

    // Filter by search query
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.nama.toLowerCase().includes(q) ||
        b.alamat.toLowerCase().includes(q) ||
        b.kota.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.tipe && b.tipe.toLowerCase().includes(q))
      );
    }

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'name-asc') return a.nama.localeCompare(b.nama);
      if (sortBy === 'name-desc') return b.nama.localeCompare(a.nama);
      if (sortBy === 'id-asc') return a.id.localeCompare(b.id);
      if (sortBy === 'city-asc') return a.kota.localeCompare(b.kota);

      // Traffic sorting (using latest 1 day traffic total)
      const aTraffic = getTrafficByBillboard(a.id, 1)[0]?.total || 0;
      const bTraffic = getTrafficByBillboard(b.id, 1)[0]?.total || 0;

      if (sortBy === 'traffic-desc') return bTraffic - aTraffic;
      if (sortBy === 'traffic-asc') return aTraffic - bTraffic;
      return 0;
    });
  }, [localCity, levelFilter, typeFilter, search, sortBy]);

  // Aggregate KPI summary for the current view
  const summary = useMemo(() => {
    const total = filteredBillboards.length;
    let high = 0;
    let medium = 0;
    let low = 0;
    let totalTraffic = 0;

    filteredBillboards.forEach(b => {
      if (b.levelTraffic === 'tinggi') high++;
      else if (b.levelTraffic === 'sedang') medium++;
      else low++;

      const latest = getTrafficByBillboard(b.id, 1)[0];
      if (latest && latest.total) totalTraffic += latest.total;
    });

    const avgTraffic = total > 0 ? Math.round(totalTraffic / total) : 0;

    return { total, high, medium, low, totalTraffic, avgTraffic };
  }, [filteredBillboards]);

  const hasActiveFilters =
    search !== '' ||
    localCity !== 'Semua' ||
    levelFilter !== 'semua' ||
    typeFilter !== 'semua' ||
    sortBy !== 'traffic-desc';

  return (
    <div className="space-y-6">
      
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Daftar Titik Reklame & Billboard
            </h2>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              {summary.total} Titik
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Wilayah: <strong className="text-slate-800">{localCity === 'Semua' ? 'Nasional (Seluruh Indonesia)' : localCity}</strong> • Klik tombol <strong>Lihat Cepat</strong> untuk membuka panel geser atau <strong>Detail</strong> untuk analisis penuh.
          </p>
        </div>

        {/* View Mode Toggle & Export */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <ExportButton city={localCity} />

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Tabel"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Grid Card"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">Total Billboard Tampil</div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
            {summary.total} <span className="text-xs font-normal text-slate-500">titik</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">Total Trafik Harian (OTS)</div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
            {(summary.totalTraffic / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-500">kontak/hr</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">Rata-rata Trafik / Titik</div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
            {(summary.avgTraffic / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-500">kontak/hr</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-400">Komposisi Trafik</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="font-bold text-rose-600 font-mono">{summary.high} T</span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-amber-600 font-mono">{summary.medium} S</span>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-emerald-600 font-mono">{summary.low} R</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            Level
          </span>
        </div>
      </div>

      {/* Advanced Filter, Search & Sort Panel */}
      <Card className="p-4 space-y-3.5">
        
        {/* Row 1: Search & City & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input (5 cols) */}
          <div className="relative md:col-span-5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID, nama titik, jalan, kota, atau tipe..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* City Selector (3 cols) */}
          <div className="relative md:col-span-3">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                value={localCity}
                onChange={(e) => {
                  setLocalCity(e.target.value);
                  if (setSelectedCity) setSelectedCity(e.target.value);
                }}
                className="w-full bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer"
              >
                {allCities.map(city => (
                  <option key={city} value={city}>
                    {city === 'Semua' ? 'Wilayah: Semua Kota' : `Kota: ${city}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sorting Dropdown (3 cols) */}
          <div className="relative md:col-span-3">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="w-full bg-transparent focus:outline-none font-semibold text-slate-800 cursor-pointer"
              >
                <option value="traffic-desc">Trafik Tertinggi</option>
                <option value="traffic-asc">Trafik Terendah</option>
                <option value="name-asc">Nama (A - Z)</option>
                <option value="name-desc">Nama (Z - A)</option>
                <option value="id-asc">Nomor ID (Asc)</option>
                <option value="city-asc">Kota (A - Z)</option>
              </select>
            </div>
          </div>

          {/* Reset button (1 col) */}
          <div className="md:col-span-1 flex justify-end">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full md:w-auto p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                title="Reset semua filter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="md:hidden">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Level & Type Pills */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Level Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Level Trafik:
            </span>
            {(['semua', 'tinggi', 'sedang', 'rendah'] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-medium text-[11px] mr-1">Tipe Layar:</span>
            {allTypes.map(typ => (
              <button
                key={typ}
                type="button"
                onClick={() => setTypeFilter(typ)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  typeFilter === typ
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {typ === 'semua' ? 'Semua Tipe' : typ}
              </button>
            ))}
          </div>

        </div>

      </Card>

      {/* Main Content: Table or Grid */}
      {filteredBillboards.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Tidak ada billboard yang sesuai kriteria pencarian
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Coba periksa kembali kata kunci pencarian atau sesuaikan pilihan filter kota dan level trafik.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Semua Filter
          </button>
        </Card>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <Card className="p-0 overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4 min-w-[260px]">Titik Billboard</th>
                  <th className="py-3 px-4">Kota / Lokasi</th>
                  <th className="py-3 px-4">Tipe & Dimensi</th>
                  <th className="py-3 px-4">Estimasi Trafik / Hari</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4 text-right min-w-[170px]">Aksi Analisis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {filteredBillboards.map((b) => {
                  const latest = getTrafficByBillboard(b.id, 1)[0];
                  const trafficTotal = latest?.total || 0;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {b.id}
                      </td>

                      {/* Name, Address & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {b.foto && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                              <img
                                src={b.foto}
                                alt={b.nama}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {b.nama}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {b.alamat}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kota */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>{b.kota}</div>
                        <div className="text-[10px] text-slate-400">{b.provinsi}</div>
                      </td>

                      {/* Type & Size */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{b.tipe || 'DOOH LED'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{b.ukuran || '12m x 24m'}</div>
                      </td>

                      {/* Traffic Volume */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 font-mono">
                          {trafficTotal.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-0.5" title="Motor">
                            <Bike className="w-3 h-3 text-emerald-600" />
                            {latest ? `${Math.round((latest.motor / trafficTotal) * 100)}%` : ''}
                          </span>
                          <span className="flex items-center gap-0.5" title="Mobil">
                            <Car className="w-3 h-3 text-blue-600" />
                            {latest ? `${Math.round((latest.mobil / trafficTotal) * 100)}%` : ''}
                          </span>
                          <span className="flex items-center gap-0.5" title="Pejalan Kaki">
                            <Footprints className="w-3 h-3 text-amber-600" />
                            {latest ? `${Math.round((latest.pejalanKaki / trafficTotal) * 100)}%` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Level Traffic Badge */}
                      <td className="py-3.5 px-4">
                        <TrafficBadge level={b.levelTraffic} />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDrawer(b)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Buka panel cepat di sebelah kanan"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Lihat Cepat</span>
                          </button>

                          <Link
                            to={`/billboard/${b.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-2.5 py-1.5 rounded-lg transition-colors shadow-2xs"
                            title="Buka halaman analisis detail penuh"
                          >
                            <span>Detail</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* GRID / CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBillboards.map((b) => {
            const latest = getTrafficByBillboard(b.id, 1)[0];
            const trafficTotal = latest?.total || 0;

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo & Badge Overlays */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {b.foto ? (
                    <img
                      src={b.foto}
                      alt={b.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      Placeholder Foto
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                  {/* Top badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-xs">
                      {b.id}
                    </span>
                    <TrafficBadge level={b.levelTraffic} />
                  </div>

                  {/* Bottom overlay info */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-600/90 backdrop-blur-xs">
                      {b.tipe || 'DOOH Digital'}
                    </span>
                    <h3 className="text-sm font-bold leading-tight mt-1 text-white line-clamp-1">
                      {b.nama}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{b.alamat}, {b.kota}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500">Dimensi:</span>
                      <span className="font-semibold text-slate-800">{b.ukuran || '12m x 24m'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Estimasi Harian (OTS):</span>
                      <span className="font-extrabold text-blue-600 font-mono text-sm">
                        {trafficTotal.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Mode Breakdown Mini Bar */}
                    <div className="grid grid-cols-4 gap-1 pt-1 text-[10px] text-center">
                      <div className="bg-emerald-50 text-emerald-800 p-1 rounded font-medium">
                        <Bike className="w-3 h-3 mx-auto mb-0.5 text-emerald-600" />
                        {latest ? `${Math.round((latest.motor / trafficTotal) * 100)}%` : '-'}
                      </div>
                      <div className="bg-blue-50 text-blue-800 p-1 rounded font-medium">
                        <Car className="w-3 h-3 mx-auto mb-0.5 text-blue-600" />
                        {latest ? `${Math.round((latest.mobil / trafficTotal) * 100)}%` : '-'}
                      </div>
                      <div className="bg-amber-50 text-amber-800 p-1 rounded font-medium">
                        <Footprints className="w-3 h-3 mx-auto mb-0.5 text-amber-600" />
                        {latest ? `${Math.round((latest.pejalanKaki / trafficTotal) * 100)}%` : '-'}
                      </div>
                      <div className="bg-purple-50 text-purple-800 p-1 rounded font-medium">
                        <Truck className="w-3 h-3 mx-auto mb-0.5 text-purple-600" />
                        {latest ? `${Math.round((latest.truk / trafficTotal) * 100)}%` : '-'}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenDrawer(b)}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lihat Cepat</span>
                    </button>

                    <Link
                      to={`/billboard/${b.id}`}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>Detail Penuh</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over Drawer for Quick Detail Inspection */}
      <BillboardDrawer
        billboard={drawerBillboard}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />

    </div>
  );
};
