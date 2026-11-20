import React from 'react';
import { Link } from 'react-router-dom';
import { BillboardCompareData, COMPARE_COLORS } from '../utils/compareCalculations';
import { TrafficBadge } from '../../../components/shared/TrafficBadge';
import { 
  Award, 
  Bike, 
  Car, 
  Footprints, 
  Truck, 
  Users, 
  Building, 
  ExternalLink,
  MapPin,
  TrendingUp,
  Coins
} from 'lucide-react';

interface ComparisonMetricsTableProps {
  billboardsData: BillboardCompareData[];
  daysCount: number;
}

export const ComparisonMetricsTable: React.FC<ComparisonMetricsTableProps> = ({
  billboardsData,
  daysCount,
}) => {
  if (billboardsData.length === 0) return null;

  // Compute maximum values for highlighting leaders
  const maxTraffic = Math.max(...billboardsData.map((b) => b.totalTraffic));
  const maxDaily = Math.max(...billboardsData.map((b) => b.avgDailyTraffic));
  const maxMotor = Math.max(...billboardsData.map((b) => b.totalMotor));
  const maxMobil = Math.max(...billboardsData.map((b) => b.totalMobil));
  const maxPejalan = Math.max(...billboardsData.map((b) => b.totalPejalanKaki));
  const maxKepadatan = Math.max(...billboardsData.map((b) => b.demografi.kepadatanPerKm2));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200">
            <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider w-44 min-w-[170px]">
              Parameter Metrik
            </th>
            {billboardsData.map((item, idx) => {
              const colorTheme = COMPARE_COLORS[idx % COMPARE_COLORS.length];
              return (
                <th
                  key={item.billboard.id}
                  className={`py-3 px-4 min-w-[220px] font-bold ${colorTheme.bg} ${colorTheme.text} border-l border-slate-200`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{item.billboard.id}</span>
                    <TrafficBadge level={item.billboard.levelTraffic} />
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">
                    {item.billboard.nama}
                  </div>
                  <div className="text-[11px] font-normal text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.billboard.kota}, {item.billboard.provinsi}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          
          {/* Section: Spesifikasi Media */}
          <tr className="bg-slate-50 font-semibold text-slate-800 text-[11px]">
            <td colSpan={billboardsData.length + 1} className="py-2 px-4 uppercase tracking-wider text-slate-500">
              Spesifikasi Fisik & Format Display
            </td>
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">Tipe Media & Format</td>
            {billboardsData.map((item) => (
              <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100 font-semibold text-slate-900">
                {item.billboard.tipe || 'DOOH LED'}
              </td>
            ))}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">Dimensi Layar</td>
            {billboardsData.map((item) => (
              <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100 font-mono text-slate-800">
                {item.billboard.ukuran || '12m x 24m'}
              </td>
            ))}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">Alamat Lengkap</td>
            {billboardsData.map((item) => (
              <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100 text-[11px] text-slate-600">
                {item.billboard.alamat}
              </td>
            ))}
          </tr>

          {/* Section: Performa Trafik */}
          <tr className="bg-slate-50 font-semibold text-slate-800 text-[11px]">
            <td colSpan={billboardsData.length + 1} className="py-2 px-4 uppercase tracking-wider text-slate-500">
              Performa Trafik ({daysCount} Hari Terakhir)
            </td>
          </tr>

          <tr>
            <td className="py-3 px-4 font-bold text-slate-900">
              Total Traffic (OTS Kumulatif)
            </td>
            {billboardsData.map((item) => {
              const isLeader = item.totalTraffic === maxTraffic;
              return (
                <td
                  key={item.billboard.id}
                  className={`py-3 px-4 border-l border-slate-100 font-mono text-sm font-extrabold ${
                    isLeader ? 'bg-emerald-50/70 text-emerald-900' : 'text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.totalTraffic.toLocaleString('id-ID')}</span>
                    {isLeader && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Award className="w-3 h-3" /> Tertinggi
                      </span>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">Rata-rata Traffic / Hari</td>
            {billboardsData.map((item) => {
              const isLeader = item.avgDailyTraffic === maxDaily;
              return (
                <td
                  key={item.billboard.id}
                  className={`py-3 px-4 border-l border-slate-100 font-mono font-bold ${
                    isLeader ? 'bg-emerald-50/40 text-emerald-800' : 'text-slate-800'
                  }`}
                >
                  {item.avgDailyTraffic.toLocaleString('id-ID')} / hari
                </td>
              );
            })}
          </tr>

          {/* Section: Kategori Kendaraan */}
          <tr className="bg-slate-50 font-semibold text-slate-800 text-[11px]">
            <td colSpan={billboardsData.length + 1} className="py-2 px-4 uppercase tracking-wider text-slate-500">
              Breakdown Kategori Moda Kendaraan
            </td>
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600 flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-emerald-600" /> Sepeda Motor
            </td>
            {billboardsData.map((item) => {
              const isLeader = item.totalMotor === maxMotor;
              return (
                <td
                  key={item.billboard.id}
                  className={`py-3 px-4 border-l border-slate-100 ${
                    isLeader ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <div className="font-bold text-slate-900 font-mono">
                    {item.totalMotor.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {item.percentMotor}% dari total traffic
                  </div>
                </td>
              );
            })}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-blue-600" /> Mobil Penumpang
            </td>
            {billboardsData.map((item) => {
              const isLeader = item.totalMobil === maxMobil;
              return (
                <td
                  key={item.billboard.id}
                  className={`py-3 px-4 border-l border-slate-100 ${
                    isLeader ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="font-bold text-slate-900 font-mono">
                    {item.totalMobil.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {item.percentMobil}% dari total traffic
                  </div>
                </td>
              );
            })}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600 flex items-center gap-1.5">
              <Footprints className="w-3.5 h-3.5 text-amber-600" /> Pejalan Kaki (Footfall)
            </td>
            {billboardsData.map((item) => {
              const isLeader = item.totalPejalanKaki === maxPejalan;
              return (
                <td
                  key={item.billboard.id}
                  className={`py-3 px-4 border-l border-slate-100 ${
                    isLeader ? 'bg-amber-50/40' : ''
                  }`}
                >
                  <div className="font-bold text-slate-900 font-mono">
                    {item.totalPejalanKaki.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {item.percentPejalanKaki}% share
                    {isLeader && (
                      <span className="ml-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                        Tertinggi
                      </span>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-purple-600" /> Truk & Angkutan Barang
            </td>
            {billboardsData.map((item) => (
              <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100">
                <div className="font-bold text-slate-900 font-mono">
                  {item.totalTruk.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                  {item.percentTruk}% share
                </div>
              </td>
            ))}
          </tr>

          {/* Section: Demografi Wilayah */}
          <tr className="bg-slate-50 font-semibold text-slate-800 text-[11px]">
            <td colSpan={billboardsData.length + 1} className="py-2 px-4 uppercase tracking-wider text-slate-500">
              Profil Demografi & Catchment Area (Radius 1km)
            </td>
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">Estimasi Pendapatan / SES</td>
            {billboardsData.map((item) => (
              <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100">
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    item.demografi.estimasiPendapatan === 'tinggi'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : item.demografi.estimasiPendapatan === 'menengah'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Kelas {item.demografi.estimasiPendapatan}
                </span>
              </td>
            ))}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">Kepadatan Penduduk</td>
            {billboardsData.map((item) => {
              const isLeader = item.demografi.kepadatanPerKm2 === maxKepadatan;
              return (
                <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100 font-mono">
                  <span className="font-bold text-slate-800">
                    {item.demografi.kepadatanPerKm2.toLocaleString('id-ID')}
                  </span>{' '}
                  <span className="text-[11px] text-slate-400">jiwa / km²</span>
                </td>
              );
            })}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">Segmen Usia Dominan</td>
            {billboardsData.map((item) => (
              <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100 font-semibold text-slate-800">
                25-34 thn ({item.demografi.distribusiUsia['25-34']}%)
                <div className="text-[11px] font-normal text-slate-400">Usia Produktif & Profesional</div>
              </td>
            ))}
          </tr>

          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">POI / Landmark Terdekat</td>
            {billboardsData.map((item) => (
              <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100">
                <div className="flex flex-wrap gap-1">
                  {item.demografi.poiTerdekat?.slice(0, 3).map((poi, pIdx) => (
                    <span
                      key={pIdx}
                      className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium"
                    >
                      {poi}
                    </span>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* Action Row */}
          <tr>
            <td className="py-3 px-4 font-medium text-slate-600">Tindakan</td>
            {billboardsData.map((item) => (
              <td key={item.billboard.id} className="py-3 px-4 border-l border-slate-100">
                <Link
                  to={`/billboard/${item.billboard.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Buka Detail
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </td>
            ))}
          </tr>

        </tbody>
      </table>
    </div>
  );
};
