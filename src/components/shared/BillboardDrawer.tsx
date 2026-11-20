import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Billboard, TimeFilter } from '../../types';
import { getTrafficByBillboard, getDemografiByBillboard } from '../../lib/mockData';
import { TrafficBadge } from './TrafficBadge';
import { FilterDate } from './FilterDate';
import { TrafficTrendChart } from '../charts/TrafficTrendChart';
import { DemografiCard } from './DemografiCard';
import {
  X,
  ExternalLink,
  MapPin,
  Maximize2,
  Bike,
  Car,
  Footprints,
  Truck,
  Copy,
  Check,
  Compass,
  ArrowRight
} from 'lucide-react';

export interface BillboardDrawerProps {
  billboard: Billboard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BillboardDrawer: React.FC<BillboardDrawerProps> = ({
  billboard,
  isOpen,
  onClose
}) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('mingguan');
  const [copied, setCopied] = useState(false);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !billboard) return null;

  const days = timeFilter === 'harian' ? 1 : timeFilter === 'mingguan' ? 7 : 30;
  const trafficRecords = getTrafficByBillboard(billboard.id, days);
  const demografi = getDemografiByBillboard(billboard.id);
  const latestTraffic = trafficRecords[trafficRecords.length - 1];

  const handleCopyCoordinates = () => {
    const text = `${billboard.lat}, ${billboard.lng}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gmapsUrl = `https://www.google.com/maps?q=${billboard.lat},${billboard.lng}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          aria-label={`Detail Billboard ${billboard.nama}`}
          className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300"
        >
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                {billboard.id}
              </span>
              <TrafficBadge level={billboard.levelTraffic} />
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                to={`/billboard/${billboard.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                title="Buka halaman detail penuh"
              >
                <span>Halaman Lengkap</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Tutup panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Title & Basic Spec */}
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {billboard.nama}
              </h2>
              <div className="flex items-start gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{billboard.alamat}, {billboard.kota}, {billboard.provinsi}</span>
              </div>

              {/* Coordinates Pill */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleCopyCoordinates}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/80 transition-colors"
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
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  Google Maps
                </a>

                {billboard.tipe && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                    {billboard.tipe}
                  </span>
                )}
                {billboard.ukuran && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {billboard.ukuran}
                  </span>
                )}
              </div>
            </div>

            {/* Photo Preview Placeholder */}
            {billboard.foto && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-44 shadow-inner group">
                <img
                  src={billboard.foto}
                  alt={billboard.nama}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white flex justify-between items-end">
                  <div>
                    <div className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Arah Hadap</div>
                    <div className="text-xs font-bold">{billboard.arahPandang || 'Arus Utama Jalan Raya'}</div>
                  </div>
                  <span className="text-[10px] bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-white/90">
                    High Visibility
                  </span>
                </div>
              </div>
            )}

            {/* Time Filter Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-slate-900">Filter Analisis Waktu</span>
              <FilterDate value={timeFilter} onChange={setTimeFilter} />
            </div>

            {/* Traffic Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                  <Bike className="w-3.5 h-3.5 text-emerald-600" />
                  Sepeda Motor
                </div>
                <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                  {latestTraffic?.motor.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500">unit / hari</div>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-800">
                  <Car className="w-3.5 h-3.5 text-blue-600" />
                  Mobil Penumpang
                </div>
                <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                  {latestTraffic?.mobil.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500">unit / hari</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
                  <Footprints className="w-3.5 h-3.5 text-amber-600" />
                  Pejalan Kaki
                </div>
                <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                  {latestTraffic?.pejalanKaki.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500">footfall / hari</div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-800">
                  <Truck className="w-3.5 h-3.5 text-purple-600" />
                  Truk & Bus
                </div>
                <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                  {latestTraffic?.truk.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-500">kargo / hari</div>
              </div>
            </div>

            {/* Traffic Trend Chart */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-900">
                  Grafik Tren Lalu Lintas ({days} Hari Terakhir)
                </h3>
              </div>
              <TrafficTrendChart
                data={trafficRecords}
                height={200}
                compact={true}
                showControls={false}
              />
            </div>

            {/* Demographics Card */}
            <DemografiCard demografi={demografi} compact={true} />

          </div>

          {/* Footer Action Buttons */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
            <Link
              to={`/compare`}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              Bandingkan
            </Link>

            <Link
              to={`/billboard/${billboard.id}`}
              className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Lihat Analisis Detail Penuh</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </aside>
      </div>
    </div>
  );
};
