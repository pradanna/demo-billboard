import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { BillboardCompareData, COMPARE_COLORS } from '../utils/compareCalculations';

interface CompareTrendChartProps {
  billboardsData: BillboardCompareData[];
}

type MetricKey = 'total' | 'motor' | 'mobil' | 'pejalanKaki' | 'truk';

const metricLabels: Record<MetricKey, string> = {
  total: 'Total Traffic (OTS)',
  motor: 'Sepeda Motor',
  mobil: 'Mobil Penumpang',
  pejalanKaki: 'Pejalan Kaki (Footfall)',
  truk: 'Truk & Bus Komersial',
};

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toLocaleString('id-ID');
};

const formatDateLabel = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const CompareTrendChart: React.FC<CompareTrendChartProps> = ({ billboardsData }) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('total');

  if (billboardsData.length === 0) return null;

  // Align dates from the first billboard's records
  const dates = billboardsData[0].trafficRecords.map((r) => r.tanggal);

  const chartData = dates.map((dateStr) => {
    const point: any = {
      tanggal: dateStr,
      tanggalLabel: formatDateLabel(dateStr),
    };

    billboardsData.forEach((item) => {
      const rec = item.trafficRecords.find((r) => r.tanggal === dateStr);
      const val = rec ? (activeMetric === 'total' ? (rec.total || (rec.motor + rec.mobil + rec.pejalanKaki + rec.truk)) : rec[activeMetric]) : 0;
      point[item.billboard.id] = val;
    });

    return point;
  });

  return (
    <div className="space-y-4">
      {/* Metric Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {(Object.keys(metricLabels) as MetricKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeMetric === key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {metricLabels[key]}
            </button>
          ))}
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Tren Harian Periode Terpilih
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
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
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
                      <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex justify-between">
                        <span>{label}</span>
                        <span className="text-[11px] font-normal text-slate-500">
                          {metricLabels[activeMetric]}
                        </span>
                      </p>
                      {payload.map((entry: any, idx: number) => {
                        const bb = billboardsData.find((b) => b.billboard.id === entry.dataKey);
                        return (
                          <div key={idx} className="flex justify-between items-center gap-3">
                            <span className="flex items-center gap-1.5 text-slate-700 truncate max-w-[150px]">
                              <span
                                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="font-medium truncate">{bb?.billboard.nama || entry.dataKey}</span>
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
                <Line
                  key={item.billboard.id}
                  type="monotone"
                  dataKey={item.billboard.id}
                  name={item.billboard.id}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
