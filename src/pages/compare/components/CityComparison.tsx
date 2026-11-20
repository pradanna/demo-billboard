import React, { useState } from 'react';
import { TimeFilter } from '../../../types';
import { getAllCities } from '../../../lib/mockData';
import { Card } from '../../../components/shared/Card';
import { 
  getCityCompareData, 
  COMPARE_COLORS, 
  getDaysCountFromFilter, 
  CityCompareData 
} from '../utils/compareCalculations';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Plus,
  Trash2,
  TrendingUp,
  BarChart3,
  MapPin,
  Award,
  Layers,
  Bike,
  Car,
  Footprints,
  Truck,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface CityComparisonProps {
  timeFilter: TimeFilter;
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toLocaleString('id-ID');
};

export const CityComparison: React.FC<CityComparisonProps> = ({ timeFilter }) => {
  const allCities = getAllCities();
  const daysCount = getDaysCountFromFilter(timeFilter);

  // Default: Jakarta vs Surabaya
  const [selectedCities, setSelectedCities] = useState<string[]>([
    allCities[0] || 'Jakarta',
    allCities[1] || 'Surabaya',
  ]);

  const [activeChartTab, setActiveChartTab] = useState<'total' | 'composition' | 'trend'>('total');

  const handleCityChange = (index: number, newCity: string) => {
    const updated = [...selectedCities];
    updated[index] = newCity;
    setSelectedCities(updated);
  };

  const handleAddCity = () => {
    if (selectedCities.length >= 4) return;
    const unselected = allCities.find((c) => !selectedCities.includes(c));
    if (unselected) {
      setSelectedCities([...selectedCities, unselected]);
    }
  };

  const handleRemoveCity = (index: number) => {
    if (selectedCities.length <= 2) return;
    setSelectedCities(selectedCities.filter((_, i) => i !== index));
  };

  const applyPreset = (cities: string[]) => {
    setSelectedCities(cities);
  };

  // Compute compare data for selected cities
  const citiesData: CityCompareData[] = selectedCities
    .map((city) => getCityCompareData(city, daysCount))
    .filter((d): d is CityCompareData => d !== null);

  // Grouped data for composition chart
  const compositionData = [
    {
      kategori: 'Motor',
      ...citiesData.reduce((acc, c) => ({ ...acc, [c.kota]: c.totalMotor }), {}),
    },
    {
      kategori: 'Mobil',
      ...citiesData.reduce((acc, c) => ({ ...acc, [c.kota]: c.totalMobil }), {}),
    },
    {
      kategori: 'Pejalan Kaki',
      ...citiesData.reduce((acc, c) => ({ ...acc, [c.kota]: c.totalPejalanKaki }), {}),
    },
    {
      kategori: 'Truk & Bus',
      ...citiesData.reduce((acc, c) => ({ ...acc, [c.kota]: c.totalTruk }), {}),
    },
  ];

  // Daily trend data aligned across cities
  const dates = citiesData[0]?.dailyTrend.map((t) => t.tanggal) || [];
  const trendData = dates.map((dateStr) => {
    const point: any = {
      tanggal: dateStr,
      tanggalLabel: new Date(dateStr).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }),
    };
    citiesData.forEach((c) => {
      const match = c.dailyTrend.find((d) => d.tanggal === dateStr);
      point[c.kota] = match ? match.total : 0;
    });
    return point;
  });

  const maxCityTraffic = Math.max(...citiesData.map((c) => c.totalTraffic));
  const maxCityAvg = Math.max(...citiesData.map((c) => c.avgDailyPerBillboard));

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
      
      {/* City Selector Card */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pilih Wilayah / Kota untuk Dibandingkan
            </h3>
            <p className="text-xs text-slate-500">
              Bandingkan agregat volume trafik, performa per titik, dan komposisi moda antar kota
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              Preset:
            </span>
            <button
              onClick={() => applyPreset(['Jakarta', 'Surabaya'])}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors"
            >
              Jakarta vs Surabaya
            </button>
            <button
              onClick={() => applyPreset(['Jakarta', 'Bandung', 'Denpasar'])}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors"
            >
              Bisnis & Wisata Utama
            </button>
            <button
              onClick={() => applyPreset(['Bandung', 'Semarang', 'Yogyakarta'])}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors"
            >
              Hub Jawa Barat & Tengah
            </button>
          </div>
        </div>

        {/* Dynamic City Slots */}
        <div className={`grid ${getGridColsClass(selectedCities.length)} gap-4`}>
          {selectedCities.map((city, index) => {
            const colorTheme = COMPARE_COLORS[index % COMPARE_COLORS.length];
            const cityData = citiesData.find((c) => c.kota === city);

            return (
              <div
                key={index}
                className={`p-3.5 rounded-xl border-2 ${colorTheme.border} ${colorTheme.bg} space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colorTheme.badge}`}>
                    Wilayah {String.fromCharCode(65 + index)}
                  </span>
                  {selectedCities.length > 2 && (
                    <button
                      onClick={() => handleRemoveCity(index)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Hapus slot wilayah"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <select
                  value={city}
                  onChange={(e) => handleCityChange(index, e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                >
                  {allCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {cityData && (
                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1">
                    <span>{cityData.provinsi}</span>
                    <span className="font-bold text-slate-800">{cityData.totalBillboards} Titik Terdaftar</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add City Button */}
        {selectedCities.length < 4 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleAddCity}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-lg transition-colors border border-blue-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Wilayah untuk Dibandingkan (Maks 4)
            </button>
          </div>
        )}
      </Card>

      {/* Side-by-Side City KPI Cards */}
      <div className={`grid ${getGridColsClass(citiesData.length)} gap-4`}>
        {citiesData.map((item, index) => {
          const colorTheme = COMPARE_COLORS[index % COMPARE_COLORS.length];
          return (
            <Card key={item.kota} className="relative overflow-hidden p-5">
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${colorTheme.badge}`} />

              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {item.kota}
                  </h4>
                  <div className="text-xs text-slate-500">{item.provinsi}</div>
                </div>
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {item.totalBillboards} Billboard
                </span>
              </div>

              {/* Total OTS Metric */}
              <div className="my-3 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Traffic Kota ({daysCount} Hari)
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                  {(item.totalTraffic / 1_000_000).toFixed(2)}M{' '}
                  <span className="text-xs font-semibold text-slate-500">OTS</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Rata-rata / titik: <strong className="text-slate-800">{(item.avgDailyPerBillboard / 1_000).toFixed(0)}k</strong> / hari
                </div>
              </div>

              {/* Vehicle Shares */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Bike className="w-3.5 h-3.5 text-emerald-600" /> Motor:
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {item.percentMotor}% ({(item.totalMotor / 1_000_000).toFixed(2)}M)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Car className="w-3.5 h-3.5 text-blue-600" /> Mobil:
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {item.percentMobil}% ({(item.totalMobil / 1_000_000).toFixed(2)}M)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Footprints className="w-3.5 h-3.5 text-amber-600" /> Pejalan:
                  </span>
                  <span className="font-bold text-slate-800 font-mono">
                    {item.percentPejalanKaki}% ({(item.totalPejalanKaki / 1_000).toFixed(0)}k)
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* City Comparison Visual Charts Container */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Visualisasi Komparasi Agregat Antar Kota
              </h3>
              <p className="text-xs text-slate-500">
                Bandingkan total OTS, volume moda kendaraan, dan fluktuasi harian antar wilayah
              </p>
            </div>
          </div>

          {/* Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setActiveChartTab('total')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeChartTab === 'total'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Total Traffic Kota
            </button>
            <button
              onClick={() => setActiveChartTab('composition')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeChartTab === 'composition'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Komposisi Moda
            </button>
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
          </div>
        </div>

        {/* Tab 1: Total Traffic OTS per Kota */}
        {activeChartTab === 'total' && (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={citiesData.map((c, i) => ({
                  name: c.kota,
                  totalTraffic: c.totalTraffic,
                  avgDailyPerBillboard: c.avgDailyPerBillboard,
                  fill: COMPARE_COLORS[i % COMPARE_COLORS.length].hex,
                }))}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [val.toLocaleString('id-ID'), 'Total OTS']}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="totalTraffic" name="Total Impresi OTS" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: Komposisi Moda Grouped per Kota */}
        {activeChartTab === 'composition' && (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={compositionData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="kategori"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [val.toLocaleString('id-ID'), `Kota ${name}`]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="square"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                {citiesData.map((c, i) => (
                  <Bar
                    key={c.kota}
                    dataKey={c.kota}
                    name={c.kota}
                    fill={COMPARE_COLORS[i % COMPARE_COLORS.length].hex}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Tren Harian Multi-Kota */}
        {activeChartTab === 'trend' && (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="tanggalLabel"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatNumber}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [val.toLocaleString('id-ID'), `Kota ${name}`]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                {citiesData.map((c, i) => {
                  const color = COMPARE_COLORS[i % COMPARE_COLORS.length].hex;
                  return (
                    <Line
                      key={c.kota}
                      type="monotone"
                      dataKey={c.kota}
                      name={c.kota}
                      stroke={color}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: color }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Aggregate City Metrics Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Matriks Agregat Perbandingan Antar Kota
            </h3>
            <p className="text-xs text-slate-500">
              Tinjauan makro pasar OOH, potensi impresi, dan kepadatan demografis
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {selectedCities.join(' vs ')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-500 uppercase tracking-wider w-48">
                  Indikator Wilayah
                </th>
                {citiesData.map((item, idx) => {
                  const colorTheme = COMPARE_COLORS[idx % COMPARE_COLORS.length];
                  return (
                    <th
                      key={item.kota}
                      className={`py-3 px-4 min-w-[200px] font-bold ${colorTheme.bg} ${colorTheme.text} border-l border-slate-200`}
                    >
                      <div className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {item.kota}
                      </div>
                      <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                        Provinsi {item.provinsi}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-600">Jumlah Titik Terdaftar</td>
                {citiesData.map((c) => (
                  <td key={c.kota} className="py-3 px-4 border-l border-slate-100 font-bold text-slate-900 font-mono">
                    {c.totalBillboards} Titik Lokasi
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-slate-900">Total Traffic OTS ({daysCount} Hari)</td>
                {citiesData.map((c) => {
                  const isLeader = c.totalTraffic === maxCityTraffic;
                  return (
                    <td
                      key={c.kota}
                      className={`py-3 px-4 border-l border-slate-100 font-mono text-sm font-extrabold ${
                        isLeader ? 'bg-emerald-50/70 text-emerald-900' : 'text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{c.totalTraffic.toLocaleString('id-ID')}</span>
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
                <td className="py-3 px-4 font-medium text-slate-600">Rata-rata OTS / Titik / Hari</td>
                {citiesData.map((c) => {
                  const isLeader = c.avgDailyPerBillboard === maxCityAvg;
                  return (
                    <td
                      key={c.kota}
                      className={`py-3 px-4 border-l border-slate-100 font-mono font-bold ${
                        isLeader ? 'bg-emerald-50/40 text-emerald-800' : 'text-slate-800'
                      }`}
                    >
                      {c.avgDailyPerBillboard.toLocaleString('id-ID')} / titik / hari
                    </td>
                  );
                })}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-emerald-600" /> Sepeda Motor
                </td>
                {citiesData.map((c) => (
                  <td key={c.kota} className="py-3 px-4 border-l border-slate-100">
                    <div className="font-bold text-slate-900 font-mono">
                      {c.totalMotor.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">{c.percentMotor}% share</div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-600" /> Mobil Penumpang
                </td>
                {citiesData.map((c) => (
                  <td key={c.kota} className="py-3 px-4 border-l border-slate-100">
                    <div className="font-bold text-slate-900 font-mono">
                      {c.totalMobil.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">{c.percentMobil}% share</div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-slate-600 flex items-center gap-1.5">
                  <Footprints className="w-3.5 h-3.5 text-amber-600" /> Pejalan Kaki
                </td>
                {citiesData.map((c) => (
                  <td key={c.kota} className="py-3 px-4 border-l border-slate-100">
                    <div className="font-bold text-slate-900 font-mono">
                      {c.totalPejalanKaki.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold">{c.percentPejalanKaki}% share</div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="py-3 px-4 font-medium text-slate-600">Rata-rata Kepadatan Penduduk</td>
                {citiesData.map((c) => (
                  <td key={c.kota} className="py-3 px-4 border-l border-slate-100 font-mono">
                    <span className="font-bold text-slate-800">{c.avgKepadatan.toLocaleString('id-ID')}</span>{' '}
                    <span className="text-[11px] text-slate-400">jiwa / km²</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Strategic Multi-City Campaign Recommendation */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 border border-indigo-200/70 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rekomendasi Alokasi Anggaran Kampanye Multi-Kota
            </h3>
            <p className="text-[11px] text-slate-500">
              Panduan bagi Brand & Media Planner untuk strategi ekspansi OOH
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Optimalisasi Mass Awareness Nasional
            </div>
            <p className="text-slate-600 leading-relaxed">
              Kombinasi <strong className="text-slate-900">{citiesData[0]?.kota}</strong> dan{' '}
              <strong className="text-slate-900">{citiesData[1]?.kota}</strong> menjangkau lebih dari{' '}
              <strong className="text-indigo-700 font-mono">
                {((citiesData.slice(0, 2).reduce((acc, c) => acc + c.totalTraffic, 0)) / 1_000_000).toFixed(1)}M impresi
              </strong>{' '}
              selama {daysCount} hari, mengamankan penetrasi brand di koridor komersial utama Indonesia.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Target Segmen Konsumen Spesifik
            </div>
            <p className="text-slate-600 leading-relaxed">
              Gunakan lokasi di kota wisata/lifestyle seperti <strong className="text-slate-900">Denpasar</strong> atau{' '}
              <strong className="text-slate-900">Bandung</strong> untuk kampanye retail dan pariwisata yang memerlukan engagement footfall tinggi, sementara jalan protokol kota metropolitan untuk campaign korporat & otomotif.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
