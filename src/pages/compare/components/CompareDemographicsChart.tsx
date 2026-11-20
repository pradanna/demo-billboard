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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { BillboardCompareData, COMPARE_COLORS } from '../utils/compareCalculations';

interface CompareDemographicsChartProps {
  billboardsData: BillboardCompareData[];
}

export const CompareDemographicsChart: React.FC<CompareDemographicsChartProps> = ({ billboardsData }) => {
  const [chartType, setChartType] = useState<'bar' | 'radar'>('bar');

  if (billboardsData.length === 0) return null;

  const ageRanges = ['0-17', '18-24', '25-34', '35-54', '55+'] as const;

  const ageData = ageRanges.map((ageGroup) => {
    const point: any = { rentangUsia: `${ageGroup} thn` };
    billboardsData.forEach((item) => {
      point[item.billboard.id] = item.demografi.distribusiUsia[ageGroup];
    });
    return point;
  });

  return (
    <div className="space-y-4">
      {/* Header and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800">
            Perbandingan Demografi Audiens Sekitar Titik
          </h4>
          <p className="text-[11px] text-slate-500">
            Persentase sebaran kelompok usia penduduk dan target audiens
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setChartType('bar')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              chartType === 'bar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              chartType === 'radar'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Radar
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={ageData}
              margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="rentangUsia"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                unit="%"
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
                          Usia: {label}
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
                                {entry.value}%
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
                iconType="circle"
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
            <RadarChart
              data={ageData}
              margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
            >
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis
                dataKey="rentangUsia"
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 45]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1 min-w-[180px]">
                        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                          Sebaran Usia Demografi
                        </p>
                        {payload.map((entry: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center gap-3">
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: entry.stroke || entry.color }}
                              />
                              {entry.name}:
                            </span>
                            <span className="font-bold font-mono text-slate-900">{entry.value}%</span>
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
                formatter={(value) => {
                  const bb = billboardsData.find((b) => b.billboard.id === value);
                  return (
                    <span className="text-slate-700 font-semibold">
                      {bb ? `${bb.billboard.id} - ${bb.billboard.nama.split('(')[0]}` : value}
                    </span>
                  );
                }}
              />
              {billboardsData.map((item, index) => {
                const color = COMPARE_COLORS[index % COMPARE_COLORS.length].hex;
                return (
                  <Radar
                    key={item.billboard.id}
                    name={item.billboard.id}
                    dataKey={item.billboard.id}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.2}
                  />
                );
              })}
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
