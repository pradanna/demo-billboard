import React from 'react';
import { Billboard, TimeFilter } from '../../../types';
import { Card } from '../../../components/shared/Card';
import { Bike, Car, Footprints, Truck, TrendingUp } from 'lucide-react';
import { getTrafficByBillboard } from '../../../lib/mockData';

interface KPISectionProps {
  billboards: Billboard[];
  timeFilter: TimeFilter;
}

export const KPISection: React.FC<KPISectionProps> = ({ billboards, timeFilter }) => {
  const days = timeFilter === 'harian' ? 1 : timeFilter === 'mingguan' ? 7 : 30;

  // Aggregate stats across filtered billboards
  let totalMotor = 0;
  let totalMobil = 0;
  let totalPejalanKaki = 0;
  let totalTruk = 0;

  billboards.forEach((b) => {
    const records = getTrafficByBillboard(b.id, days);
    records.forEach((r) => {
      totalMotor += r.motor;
      totalMobil += r.mobil;
      totalPejalanKaki += r.pejalanKaki;
      totalTruk += r.truk;
    });
  });

  const totalOTS = totalMotor + totalMobil + totalPejalanKaki + totalTruk;
  const totalBillboardsCount = billboards.length;
  const avgTrafficPerDay =
    totalBillboardsCount > 0 ? Math.round(totalOTS / (totalBillboardsCount * days)) : 0;

  const motorPct = totalOTS > 0 ? ((totalMotor / totalOTS) * 100).toFixed(1) : '0';
  const mobilPct = totalOTS > 0 ? ((totalMobil / totalOTS) * 100).toFixed(1) : '0';
  const pejalanPct = totalOTS > 0 ? ((totalPejalanKaki / totalOTS) * 100).toFixed(1) : '0';
  const trukPct = totalOTS > 0 ? ((totalTruk / totalOTS) * 100).toFixed(1) : '0';

  const tinggiCount = billboards.filter((b) => b.levelTraffic === 'tinggi').length;
  const sedangCount = billboards.filter((b) => b.levelTraffic === 'sedang').length;
  const rendahCount = billboards.filter((b) => b.levelTraffic === 'rendah').length;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toLocaleString('id-ID');
  };

  const periodLabel =
    timeFilter === 'harian'
      ? '24 Jam Terakhir'
      : timeFilter === 'mingguan'
      ? '7 Hari Terakhir'
      : '30 Hari Terakhir';

  return (
    <div className="space-y-4">
      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Billboard */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Titik Billboard</span>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Aktif
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {totalBillboardsCount}{' '}
              <span className="text-sm font-semibold text-slate-500">Titik</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Sebaran lokasi komersial terpilih</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {tinggiCount} Tinggi
            </span>
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {sedangCount} Sedang
            </span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {rendahCount} Rendah
            </span>
          </div>
        </Card>

        {/* KPI 2: Total OTS Volume */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500">Estimasi Total Exposure</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {periodLabel}
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatNumber(totalOTS)}{' '}
              <span className="text-sm font-semibold text-slate-500">OTS</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Opportunity to See akumulatif</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>Rata-rata Harian:</span>
            <span className="font-bold text-slate-800">
              {formatNumber(Math.round(totalOTS / days))} OTS / hari
            </span>
          </div>
        </Card>

        {/* KPI 3: Rata-Rata Traffic per Titik */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500">Rata-Rata per Billboard</span>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Intensitas
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatNumber(avgTrafficPerDay)}{' '}
              <span className="text-sm font-semibold text-slate-500">/ hari</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Tingkat perlintasan per titik</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span>Volume Tertinggi:</span>
            <span className="font-bold text-emerald-600">~485k OTS/hari</span>
          </div>
        </Card>

        {/* KPI 4: Kendaraan Roda 2 vs 4 Dominance */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group hover:border-amber-200 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-slate-500">Dominasi Moda Jalan</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Roda 2 & 4
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {((Number(motorPct) + Number(mobilPct))).toFixed(0)}%{' '}
              <span className="text-sm font-semibold text-slate-500">Kendaraan</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Motor ({motorPct}%) & Mobil ({mobilPct}%)</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Footprints className="w-3 h-3 text-amber-600" /> Footfall: {pejalanPct}%
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3 text-purple-600" /> Kargo: {trukPct}%
            </span>
          </div>
        </Card>

      </div>

      {/* Mode Distribution Mini Bar */}
      <Card className="p-3 sm:p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Distribusi Komposisi Traffic per Kategori:</span>
            <span className="text-[11px] text-slate-400">({periodLabel})</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-700">
              <Bike className="w-3.5 h-3.5 text-emerald-600" />
              <strong>Motor:</strong> {formatNumber(totalMotor)} ({motorPct}%)
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <Car className="w-3.5 h-3.5 text-blue-600" />
              <strong>Mobil:</strong> {formatNumber(totalMobil)} ({mobilPct}%)
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <Footprints className="w-3.5 h-3.5 text-amber-600" />
              <strong>Pejalan Kaki:</strong> {formatNumber(totalPejalanKaki)} ({pejalanPct}%)
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <Truck className="w-3.5 h-3.5 text-purple-600" />
              <strong>Truk:</strong> {formatNumber(totalTruk)} ({trukPct}%)
            </span>
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          <div style={{ width: `${motorPct}%` }} className="bg-emerald-500 h-full" title={`Motor: ${motorPct}%`} />
          <div style={{ width: `${mobilPct}%` }} className="bg-blue-600 h-full" title={`Mobil: ${mobilPct}%`} />
          <div style={{ width: `${pejalanPct}%` }} className="bg-amber-400 h-full" title={`Pejalan Kaki: ${pejalanPct}%`} />
          <div style={{ width: `${trukPct}%` }} className="bg-purple-500 h-full" title={`Truk/Bus: ${trukPct}%`} />
        </div>
      </Card>
    </div>
  );
};