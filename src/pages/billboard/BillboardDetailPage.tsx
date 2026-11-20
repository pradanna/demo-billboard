import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getBillboardById,
  getTrafficByBillboard,
  getDemografiByBillboard,
  getBillboards
} from '../../lib/mockData';
import { Card } from '../../components/shared/Card';
import { TrafficBadge } from '../../components/shared/TrafficBadge';
import { FilterDate } from '../../components/shared/FilterDate';
import {
  TrafficTrendChart,
  TrafficCategoryDonut,
  HourlyTrafficChart
} from '../../components/charts';
import { DemografiCard } from '../../components/shared/DemografiCard';
import { ExportButton } from '../../components/shared/ExportButton';
import { TimeFilter } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Bike,
  Car,
  Footprints,
  Truck,
  Building,
  CheckCircle2,
  Maximize2,
  Copy,
  Check,
  ExternalLink,
  Layers,
  FileText,
  Clock,
  TrendingUp,
  Compass,
  Sparkles,
  BarChart3,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';

export const BillboardDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('mingguan');
  const [activeChartTab, setActiveChartTab] = useState<'trend' | 'composition' | 'hourly'>('trend');
  const [copied, setCopied] = useState(false);

  // Fallback to first billboard if invalid id
  const billboard = getBillboardById(id || '') || getBillboards()[0];

  const days = timeFilter === 'harian' ? 1 : timeFilter === 'mingguan' ? 7 : 30;
  const trafficRecords = getTrafficByBillboard(billboard.id, days);
  const demografi = getDemografiByBillboard(billboard.id);

  // Totals over the selected period
  const periodTotals = trafficRecords.reduce(
    (acc, curr) => {
      acc.motor += curr.motor;
      acc.mobil += curr.mobil;
      acc.pejalanKaki += curr.pejalanKaki;
      acc.truk += curr.truk;
      acc.total += (curr.total || (curr.motor + curr.mobil + curr.pejalanKaki + curr.truk));
      return acc;
    },
    { motor: 0, mobil: 0, pejalanKaki: 0, truk: 0, total: 0 }
  );

  const dailyAvg = Math.round(periodTotals.total / days);

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${billboard.lat}, ${billboard.lng}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gmapsUrl = `https://www.google.com/maps?q=${billboard.lat},${billboard.lng}`;

  return (
    <div className="space-y-6">
      
      {/* Breadcrumbs & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Link to="/dashboard" className="hover:text-slate-900 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link to="/billboard" className="hover:text-slate-900 transition-colors">
              Daftar Billboard
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800 font-mono">{billboard.id}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              {billboard.id}
            </span>
            <TrafficBadge level={billboard.levelTraffic} />
            <span className="text-xs font-medium text-slate-500">
              • {billboard.tipe || 'DOOH Digital'} ({billboard.ukuran || '12m x 24m'})
            </span>
            <span className="text-xs text-slate-500">• {billboard.kota}, {billboard.provinsi}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            {billboard.nama}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {billboard.alamat}
            </span>

            <button
              type="button"
              onClick={handleCopyCoordinates}
              className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors cursor-pointer"
              title="Salin koordinat GPS"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>{billboard.lat}, {billboard.lng}</span>
                </>
              )}
            </button>

            <a
              href={gmapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 underline"
            >
              <ExternalLink className="w-3 h-3" />
              Buka Google Maps
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Link
            to="/compare"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Bandingkan</span>
          </Link>

          <ExportButton
            billboard={billboard}
            timeFilter={timeFilter === 'bulanan' ? 'bulanan' : timeFilter === 'harian' ? 'harian' : 'mingguan'}
          />

          <Link
            to="/reports"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Pusat Laporan</span>
          </Link>
        </div>
      </div>

      {/* Hero Showcase: Billboard Image & Tech Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Billboard Photo Showcase (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs flex flex-col">
          <div className="relative h-60 sm:h-72 bg-slate-900 group">
            {billboard.foto ? (
              <img
                src={billboard.foto}
                alt={billboard.nama}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Foto Tidak Tersedia
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />

            {/* Overlays */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span className="text-[11px] font-bold text-white bg-blue-600/90 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                {billboard.tipe || 'DOOH Digital'}
              </span>
              <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Izin Operasional Aktif
              </span>
            </div>

            <div className="absolute bottom-3 left-3 right-3 text-white">
              <div className="text-[10px] uppercase font-semibold text-slate-300 tracking-wider">
                Arah Sudut Pandang (Facing)
              </div>
              <div className="text-xs sm:text-sm font-bold flex items-center gap-1.5 mt-0.5">
                <Compass className="w-4 h-4 text-blue-400 shrink-0" />
                <span>{billboard.arahPandang || `Menghadap arus lalu lintas utama ${billboard.alamat}`}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Visibilitas: <strong className="text-slate-800">200m+ Garis Lurus</strong></span>
            <span>Pencahayaan: <strong className="text-slate-800">24 Jam (LED Backlit)</strong></span>
          </div>
        </div>

        {/* Technical Specifications & Site Information (7 cols) */}
        <Card className="lg:col-span-7 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                Spesifikasi Teknis & Konstruksi Billboard
              </h2>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">
                Asset ID: {billboard.id}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[11px]">Dimensi Layar</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5 font-mono">
                  {billboard.ukuran || '12m x 24m'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Luas ~288 m²</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[11px]">Format Media</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {billboard.tipe?.includes('Static') ? 'Static Vinyl' : 'DOOH Video / Animasi'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spot Durasi 15-30s</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[11px]">Tingkat Paparan (OTS)</div>
                <div className="font-extrabold text-blue-700 text-sm mt-0.5 capitalize">
                  Level {billboard.levelTraffic}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Trafik Padat</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[11px]">Ketinggian Titik</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  12 Meter
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Clear Line of Sight</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[11px]">Resolusi Tampilan</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5 font-mono">
                  {billboard.tipe?.includes('Static') ? 'High-Res Print' : 'P8 / P10 SMD LED'}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Full Color Outdoor</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-slate-400 text-[11px]">Kategori Wilayah</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                  Komersial & Bisnis
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Arteri Utama {billboard.kota}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">
              Lokasi GPS Terverifikasi: <strong className="text-slate-800 font-mono">{billboard.lat}, {billboard.lng}</strong>
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-200">
              Siap Tayang (Available)
            </span>
          </div>
        </Card>

      </div>

      {/* Time Filter Controls & Period Summary */}
      <Card className="p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Rentang Analisis Lalu Lintas
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Menampilkan data performa {days} hari ({trafficRecords[0]?.tanggal} s/d {trafficRecords[trafficRecords.length - 1]?.tanggal})
            </p>
          </div>

          <FilterDate value={timeFilter} onChange={setTimeFilter} />
        </div>
      </Card>

      {/* Mode Traffic Metric Cards (Motor, Mobil, Pejalan Kaki, Truk, Total) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Total OTS */}
        <div className="col-span-2 lg:col-span-1 bg-slate-900 text-white rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-slate-400 text-xs font-semibold flex items-center justify-between">
              <span>Total Paparan (OTS)</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-extrabold font-mono mt-2 text-white">
              {(periodTotals.total / 1000).toFixed(0)}k
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Total {days} hari</div>
          </div>
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300 mt-3">
            Rata-rata: <strong className="text-white font-mono">{dailyAvg.toLocaleString('id-ID')}</strong> / hari
          </div>
        </div>

        {/* Sepeda Motor */}
        <Card className="p-4 bg-emerald-50/40 border-emerald-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-emerald-600" /> Sepeda Motor
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                {Math.round((periodTotals.motor / periodTotals.total) * 100)}%
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-2">
              {periodTotals.motor.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Roda 2 di periode ini</div>
          </div>
          <div className="pt-2 border-t border-emerald-100 text-[11px] text-slate-500 mt-2">
            Rata-rata: <strong className="text-slate-800 font-mono">{Math.round(periodTotals.motor / days).toLocaleString('id-ID')}</strong> / hari
          </div>
        </Card>

        {/* Mobil Penumpang */}
        <Card className="p-4 bg-blue-50/40 border-blue-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
              <span className="flex items-center gap-1.5">
                <Car className="w-4 h-4 text-blue-600" /> Mobil Pribadi
              </span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                {Math.round((periodTotals.mobil / periodTotals.total) * 100)}%
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-2">
              {periodTotals.mobil.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Roda 4 di periode ini</div>
          </div>
          <div className="pt-2 border-t border-blue-100 text-[11px] text-slate-500 mt-2">
            Rata-rata: <strong className="text-slate-800 font-mono">{Math.round(periodTotals.mobil / days).toLocaleString('id-ID')}</strong> / hari
          </div>
        </Card>

        {/* Pejalan Kaki */}
        <Card className="p-4 bg-amber-50/40 border-amber-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
              <span className="flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-amber-600" /> Pejalan Kaki
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                {Math.round((periodTotals.pejalanKaki / periodTotals.total) * 100)}%
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-2">
              {periodTotals.pejalanKaki.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Footfall trotoar</div>
          </div>
          <div className="pt-2 border-t border-amber-100 text-[11px] text-slate-500 mt-2">
            Rata-rata: <strong className="text-slate-800 font-mono">{Math.round(periodTotals.pejalanKaki / days).toLocaleString('id-ID')}</strong> / hari
          </div>
        </Card>

        {/* Truk & Bus */}
        <Card className="p-4 bg-purple-50/40 border-purple-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-purple-800">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-600" /> Truk & Bus
              </span>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-mono">
                {Math.round((periodTotals.truk / periodTotals.total) * 100)}%
              </span>
            </div>
            <div className="text-xl font-extrabold text-slate-900 font-mono mt-2">
              {periodTotals.truk.toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Kargo & angkutan umum</div>
          </div>
          <div className="pt-2 border-t border-purple-100 text-[11px] text-slate-500 mt-2">
            Rata-rata: <strong className="text-slate-800 font-mono">{Math.round(periodTotals.truk / days).toLocaleString('id-ID')}</strong> / hari
          </div>
        </Card>

      </div>

      {/* Main Analysis Section: Visual Chart Tabs & Demographics Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 7-8 cols: Interactive Charts */}
        <Card className="lg:col-span-8 p-5 flex flex-col justify-between">
          <div>
            {/* Chart Sub-Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Visualisasi & Analisis Trafik Kendaraan
                </h2>
                <p className="text-[11px] text-slate-500">
                  Data breakdown per kategori moda transportasi
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('trend')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeChartTab === 'trend'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tren Waktu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab('composition')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeChartTab === 'composition'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <PieIcon className="w-3.5 h-3.5" />
                  <span>Komposisi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveChartTab('hourly')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeChartTab === 'hourly'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Jam Sibuk</span>
                </button>
              </div>
            </div>

            {/* Tab Views */}
            {activeChartTab === 'trend' && (
              <div className="space-y-4">
                <TrafficTrendChart
                  data={trafficRecords}
                  height={320}
                  showControls={true}
                />
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                  <span>💡 Tip: Klik label kategori di atas grafik untuk menyembunyikan atau menampilkan moda tertentu.</span>
                  <span className="font-semibold text-slate-700">Periode: {days} Hari Terakhir</span>
                </div>
              </div>
            )}

            {activeChartTab === 'composition' && (
              <div className="space-y-4 pt-2">
                <TrafficCategoryDonut
                  records={trafficRecords}
                  height={260}
                />
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500">
                  Komposisi ini menunjukkan proporsi audiens bergerak. Roda 2 mendominasi paparan instan (commuting), sedangkan pengendara mobil memiliki waktu paparan lebih stabil saat menunggu di traffic light / persimpangan.
                </div>
              </div>
            )}

            {activeChartTab === 'hourly' && (
              <div className="space-y-4 pt-2">
                <HourlyTrafficChart
                  dailyTraffic={dailyAvg}
                  height={260}
                />
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Puncak Paparan Tertinggi (Prime Time):</strong> Pukul <strong>07:00 - 09:00 WIB</strong> (jam berangkat kerja/sekolah) dan pukul <strong>17:00 - 20:00 WIB</strong> (jam pulang kantor & aktivitas belanja malam).
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Right 4-5 cols: Demographics Card */}
        <div className="lg:col-span-4">
          <DemografiCard demografi={demografi} />
        </div>

      </div>

      {/* Strategic Advertising Value & Campaign Recommendation Card */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Rekomendasi Kampanye & Potensi Nilai Iklan (OOH Intelligence)
              </h2>
              <p className="text-xs text-slate-300">
                Analisis kecocokan brand dan audiens sasaran berdasarkan data traffic & demografi
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-white/10 backdrop-blur-xs px-3 py-1 rounded-full text-blue-200 border border-white/10 self-start sm:self-auto">
            Brand Fit Score: 94 / 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Col 1 */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider mb-1">
              Profil Audiens Utama
            </div>
            <div className="text-sm font-bold text-white">
              Usia Produktif 25 - 34 Tahun (38%)
            </div>
            <p className="text-slate-300 text-[11px] mt-2 leading-relaxed">
              Didominasi oleh kalangan pekerja profesional, eksekutif muda, dan mahasiswa dengan tingkat pengeluaran menengah ke atas (SES {demografi.estimasiPendapatan}).
            </p>
          </div>

          {/* Col 2 */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider mb-1">
              Kategori Brand Paling Relevan
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium text-[11px]">
                Otomotif (EV & Motor)
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium text-[11px]">
                Perbankan & Fintech
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium text-[11px]">
                Smartphone / Gadget
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium text-[11px]">
                F&B & Lifestyle
              </span>
            </div>
          </div>

          {/* Col 3 */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider mb-1">
              Estimasi CPM Benchmark
            </div>
            <div className="text-sm font-bold text-white font-mono">
              Rp 12.500 - Rp 18.000 / 1.000 Kontak
            </div>
            <p className="text-slate-300 text-[11px] mt-2 leading-relaxed">
              Efisiensi biaya kontak per tayang sangat kompetitif dibandingkan media digital performa tinggi dengan penetrasi visual 100% tanpa ad-block.
            </p>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Titik ini berada di koridor komersial premium dengan traffic konsisten tinggi tiap hari.</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/compare`}
              className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              Bandingkan Titik
            </Link>
            <Link
              to={`/reports`}
              className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors shadow-xs"
            >
              Unduh Dossier Klien
            </Link>
          </div>
        </div>
      </Card>

    </div>
  );
};
