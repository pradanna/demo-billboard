import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BillboardCompareData, COMPARE_COLORS } from '../utils/compareCalculations';

interface CompareCategoryBarChartProps {
  billboardsData: BillboardCompareData[];
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toLocaleString('id-ID');
};

export const CompareCategoryBarChart: React.FC<CompareCategoryBarChartProps> = ({ billboardsData }) => {
  const [viewMode, setViewMode] = useState<'grouped' | 'percentage'>('grouped');

  if (billboardsData.length === 0) return null;

  // Mode 1: Grouped by Category (Motor, Mobil, Pejalan Kaki, Truk)
  // Each category has bars for each Billboard
  const categoryKeys = [
    { key: 'motor', label: 'Motor' },
    { key: 'mobil', label: 'Mobil' },
    { key: 'pejalanKaki', label: 'Pejalan Kaki' },
    { key: 'truk', label: 'Truk & Bus' },
  ];

  const groupedData = categoryKeys.map((cat) => {
    const point: any = { kategori: cat.label };
    billboardsData.forEach((item) => {
      point[item.billboard.id] = (item as any)[`total${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}`];
    });
    return point;
  });

  // Mode 2: Percentage composition stacked 100% per billboard
  const percentageData = billboardsData.map((item) => ({
    name: item.billboard.id,
    fullName: item.billboard.nama,
    motor: item.percentMotor,
    mobil: item.percentMobil,
    pejalanKaki: item.percentPejalanKaki,
    truk: item.percentTruk,
  }));

  return (
    <div className="space-y-4">
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800">
            {viewMode === 'grouped' ? 'Volume Total per Kategori Moda' : 'Komposisi Share Kendaraan (100%)'}
          </h4>
          <p className="text-[11px] text-slate-500">
            {viewMode === 'grouped'
              ? 'Bandingkan volume motor, mobil, pejalan, dan truk antar titik'
              : 'Proporsi perbandingan audiens kendaraan & pejalan kaki'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              viewMode === 'grouped'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Volume Absolut
          </button>
          <button
            onClick={() => setViewMode('percentage')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              viewMode === 'percentage'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Proporsi (%)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'grouped' ? (
            <BarChart
              data={groupedData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="kategori"
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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[190px]">
                        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                          Kategori: {label}
                        </p>
                        {payload.map((entry: any, idx: number) => {
                          const bb = billboardsData.find((b) => b.billboard.id === entry.dataKey);
                          return (
                            <div key={idx} className="flex justify-between items-center gap-3">
                              <span className="flex items-center gap-1.5 text-slate-700 truncate max-w-[140px]">
                                <span
                                  className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="truncate">{bb?.billboard.nama || entry.dataKey}</span>
                              </span>
                              <span className="font-bold font-mono text-slate-900">
                                {entry.value?.toLocaleString('id-ID')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="square"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                formatter={(value) => {
                  const bb = billboardsData.find((b) => b.billboard.id === value);
                  return (
                    <span className="text-slate-700 font-semibold">
                      {bb ? `${bb.billboard.id} - ${bb.billboard.nama.split('(')[0]}` : value}
                    </span>
                  );
                }}
              />
              {billboardsData.map((item, index) => (
                <Bar
                  key={item.billboard.id}
                  dataKey={item.billboard.id}
                  name={item.billboard.id}
                  fill={COMPARE_COLORS[index % COMPARE_COLORS.length].hex}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : (
            <BarChart
              data={percentageData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const bb = billboardsData.find((b) => b.billboard.id === label);
                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
                        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                          {bb?.billboard.nama || label}
                        </p>
                        {payload.map((entry: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center gap-3">
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <span
                                className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                                style={{ backgroundColor: entry.color }}
                              />
                              {entry.name}:
                            </span>
                            <span className="font-bold font-mono text-slate-900">
                              {entry.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              <Bar dataKey="motor" name="Motor" stackId="a" fill="#10b981" />
              <Bar dataKey="mobil" name="Mobil" stackId="a" fill="#3b82f6" />
              <Bar dataKey="pejalanKaki" name="Pejalan Kaki" stackId="a" fill="#f59e0b" />
              <Bar dataKey="truk" name="Truk & Bus" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
