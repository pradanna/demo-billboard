import React from 'react';
import { BillboardCompareData, COMPARE_COLORS } from '../utils/compareCalculations';
import { TrendingUp, Award, Footprints, Car, Target, CheckCircle2 } from 'lucide-react';

interface ComparisonInsightsProps {
  billboardsData: BillboardCompareData[];
  daysCount: number;
}

export const ComparisonInsights: React.FC<ComparisonInsightsProps> = ({ billboardsData, daysCount }) => {
  if (billboardsData.length < 2) return null;

  // Find leaders
  const sortedByTraffic = [...billboardsData].sort((a, b) => b.totalTraffic - a.totalTraffic);
  const trafficLeader = sortedByTraffic[0];
  const trafficRunnerUp = sortedByTraffic[1];
  const trafficDiffPercent = Math.round(
    ((trafficLeader.totalTraffic - trafficRunnerUp.totalTraffic) / trafficRunnerUp.totalTraffic) * 100
  );

  const sortedByPedestrian = [...billboardsData].sort((a, b) => b.totalPejalanKaki - a.totalPejalanKaki);
  const pedestrianLeader = sortedByPedestrian[0];

  const sortedByCar = [...billboardsData].sort((a, b) => b.totalMobil - a.totalMobil);
  const carLeader = sortedByCar[0];

  const highIncomeBillboards = billboardsData.filter(
    (b) => b.demografi.estimasiPendapatan === 'tinggi'
  );

  return (
    <div className="bg-gradient-to-br from-blue-50/80 via-white to-slate-50 border border-blue-200/70 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Executive Strategic Insights & Rekomendasi Kampanye
            </h3>
            <p className="text-[11px] text-slate-500">
              Analisis otomatis berbasis performa komparasi data {daysCount} hari
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full">
          AI Strategy Advisory
        </span>
      </div>

      {/* Insight Bullet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Insight 1: Traffic Leader */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            <span>Volume OTS Terbesar</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900">{trafficLeader.billboard.nama}</strong> memimpin dengan total{' '}
            <strong className="text-emerald-700 font-mono">
              {(trafficLeader.totalTraffic / 1000).toFixed(0)}k impresi
            </strong>{' '}
            ({trafficDiffPercent > 0 ? `+${trafficDiffPercent}% lebih tinggi` : 'impresi setara'} dibanding {trafficRunnerUp.billboard.id}).
          </p>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sangat optimal untuk Mass Awareness & FMCG
          </div>
        </div>

        {/* Insight 2: Footfall / Retail */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <span className="p-1 rounded-md bg-amber-50 text-amber-600">
              <Footprints className="w-3.5 h-3.5" />
            </span>
            <span>Target Footfall Pejalan Kaki</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong className="text-slate-900">{pedestrianLeader.billboard.nama}</strong> memiliki volume pejalan kaki tertinggi dengan{' '}
            <strong className="text-amber-700 font-mono">
              {(pedestrianLeader.totalPejalanKaki / 1000).toFixed(0)}k pejalan
            </strong>{' '}
            ({pedestrianLeader.percentPejalanKaki}% share).
          </p>
          <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sangat efektif untuk F&B, QSR, Fashion, Retail
          </div>
        </div>

        {/* Insight 3: SES / Automotive & Luxury */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <span className="p-1 rounded-md bg-purple-50 text-purple-600">
              <Car className="w-3.5 h-3.5" />
            </span>
            <span>Profil SES & Segmen Premium</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {highIncomeBillboards.length > 0 ? (
              <>
                <strong className="text-slate-900">{carLeader.billboard.nama}</strong> berada di kawasan profil SES{' '}
                <strong className="text-purple-700">Kelas {carLeader.demografi.estimasiPendapatan}</strong> dengan volume mobil{' '}
                <strong className="text-slate-900 font-mono">{(carLeader.totalMobil / 1000).toFixed(0)}k unit</strong>.
              </>
            ) : (
              <>
                Semua lokasi terpilih memiliki profil demografi kelas menengah dengan dominasi audiens usia produktif 25-34 tahun.
              </>
            )}
          </p>
          <div className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Rekomendasi: Banking, Fintech, Properti, Otomotif
          </div>
        </div>

      </div>
    </div>
  );
};
