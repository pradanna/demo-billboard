import React from 'react';
import { Demografi } from '../../types';
import { Card } from './Card';
import { Users, Building2, Wallet, MapPin, Sparkles } from 'lucide-react';

export interface DemografiCardProps {
  demografi: Demografi;
  className?: string;
  compact?: boolean;
}

export const DemografiCard: React.FC<DemografiCardProps> = ({
  demografi,
  className = '',
  compact = false
}) => {
  // Find dominant age bracket
  const dominantAge = Object.entries(demografi.distribusiUsia).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ['', 0]
  );

  const getIncomeBadge = (inc: string) => {
    switch (inc) {
      case 'tinggi':
        return {
          label: 'SES A / Tinggi',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'menengah':
        return {
          label: 'SES B / Menengah',
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'rendah':
      default:
        return {
          label: 'SES C / Rendah',
          color: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  const incomeInfo = getIncomeBadge(demografi.estimasiPendapatan);

  return (
    <Card className={`p-4 sm:p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Demografi & Profil Audiens</h3>
            <p className="text-[11px] text-slate-500">Estimasi catchment area radius 1 km</p>
          </div>
        </div>
        <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Radius 1 KM
        </span>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        {/* Total Penduduk */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Total Penduduk</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 font-mono mt-1">
            {demografi.totalPenduduk.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Jiwa di catchment area</div>
        </div>

        {/* Kepadatan */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Kepadatan</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 font-mono mt-1">
            {demografi.kepadatanPerKm2.toLocaleString('id-ID')}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Jiwa / km²</div>
        </div>

        {/* Estimasi Pendapatan SES */}
        <div className="col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Profil Daya Beli (SES)</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">Tingkat pengeluaran rata-rata</div>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${incomeInfo.color}`}>
            {incomeInfo.label}
          </span>
        </div>
      </div>

      {/* Gender Ratio */}
      {demografi.rasioGender && (
        <div className="mb-4 bg-slate-50/70 border border-slate-100 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Rasio Gender</span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-blue-700 font-bold">Pria {demografi.rasioGender.pria}%</span>
              <span className="text-pink-600 font-bold">Wanita {demografi.rasioGender.wanita}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${demografi.rasioGender.pria}%` }}
              className="bg-blue-500 h-full transition-all"
            />
            <div
              style={{ width: `${demografi.rasioGender.wanita}%` }}
              className="bg-pink-400 h-full transition-all"
            />
          </div>
        </div>
      )}

      {/* Age Distribution */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-800">Distribusi Usia Penduduk</span>
          <span className="text-[10px] text-slate-500">
            Dominan: <strong className="text-blue-600">{dominantAge[0]} th ({dominantAge[1]}%)</strong>
          </span>
        </div>

        <div className="space-y-1.5">
          {Object.entries(demografi.distribusiUsia).map(([range, pct]) => {
            const isDominant = range === dominantAge[0];
            return (
              <div key={range} className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className={`font-medium ${isDominant ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>
                    {range} tahun {isDominant && '★'}
                  </span>
                  <span className={`font-mono ${isDominant ? 'text-blue-700 font-bold' : 'text-slate-700'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all ${
                      isDominant ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nearby POIs */}
      {demografi.poiTerdekat && demografi.poiTerdekat.length > 0 && (
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 mb-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span>Titik Keramaian Utama (POI Sekitar):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {demografi.poiTerdekat.map((poi, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200/60 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                {poi}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Area Context Description */}
      {!compact && demografi.deskripsiWilayah && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed italic bg-blue-50/40 p-2.5 rounded-lg border border-blue-50">
          "{demografi.deskripsiWilayah}"
        </div>
      )}
    </Card>
  );
};
