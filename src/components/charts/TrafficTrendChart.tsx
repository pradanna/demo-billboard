import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrafficRecord } from '../../types';

export interface TrafficTrendChartProps {
  data: TrafficRecord[];
  height?: number;
  showControls?: boolean;
  compact?: boolean;
  className?: string;
}

export const TrafficTrendChart: React.FC<TrafficTrendChartProps> = ({
  data,
  height = 320,
  showControls = true,
  compact = false,
  className = ''
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [activeSeries, setActiveSeries] = useState<{
    motor: boolean;
    mobil: boolean;
    pejalanKaki: boolean;
    truk: boolean;
  }>({
    motor: true,
    mobil: true,
    pejalanKaki: true,
    truk: true
  });

  const toggleSeries = (key: keyof typeof activeSeries) => {
    setActiveSeries(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Format date helper for X-Axis (e.g. "2026-11-18" -> "18 Nov")
  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
          'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];
        const day = parseInt(parts[2], 10);
        const monthIdx = parseInt(parts[1], 10) - 1;
        return `${day} ${monthNames[monthIdx] || ''}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Format number for Y-Axis
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dayTotal = payload.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0);

      return (
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-lg text-xs min-w-44 z-50">
          <div className="font-bold text-slate-800 pb-1.5 mb-1.5 border-b border-slate-100 flex justify-between items-center">
            <span>{formatDate(label)}</span>
            <span className="text-[10px] text-slate-400 font-normal">{label}</span>
          </div>
          <div className="space-y-1.5">
            {payload.map((item: any) => (
              <div key={item.dataKey} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}:
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  {Number(item.value).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-2 mt-2 border-t border-slate-100 flex justify-between items-center font-bold text-slate-900">
            <span>Total Lalu Lintas:</span>
            <span className="text-blue-600 font-mono">
              {dayTotal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Controls: Mode toggles and Chart Type */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-medium mr-1 hidden sm:inline">Kategori:</span>
            
            <button
              type="button"
              onClick={() => toggleSeries('motor')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSeries.motor
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                  : 'bg-slate-100 text-slate-400 border border-transparent line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Motor
            </button>

            <button
              type="button"
              onClick={() => toggleSeries('mobil')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSeries.mobil
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                  : 'bg-slate-100 text-slate-400 border border-transparent line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Mobil
            </button>

            <button
              type="button"
              onClick={() => toggleSeries('pejalanKaki')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSeries.pejalanKaki
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs'
                  : 'bg-slate-100 text-slate-400 border border-transparent line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pejalan Kaki
            </button>

            <button
              type="button"
              onClick={() => toggleSeries('truk')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeSeries.truk
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-xs'
                  : 'bg-slate-100 text-slate-400 border border-transparent line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Truk & Bus
            </button>
          </div>

          {/* Chart Type Selector */}
          {!compact && (
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-[11px] font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartType === 'area'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Area
              </button>
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  chartType === 'bar'
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                Batang
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chart Canvas */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMotor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMobil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPejalan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTruk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="tanggal"
                tickFormatter={formatDate}
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {compact && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />}

              {activeSeries.motor && (
                <Area
                  type="monotone"
                  dataKey="motor"
                  name="Sepeda Motor"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMotor)"
                />
              )}
              {activeSeries.mobil && (
                <Area
                  type="monotone"
                  dataKey="mobil"
                  name="Mobil Penumpang"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMobil)"
                />
              )}
              {activeSeries.pejalanKaki && (
                <Area
                  type="monotone"
                  dataKey="pejalanKaki"
                  name="Pejalan Kaki"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPejalan)"
                />
              )}
              {activeSeries.truk && (
                <Area
                  type="monotone"
                  dataKey="truk"
                  name="Truk & Bus"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTruk)"
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="tanggal"
                tickFormatter={formatDate}
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fill: '#64748b', fontSize: 11 }}
                stroke="#cbd5e1"
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {compact && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />}

              {activeSeries.motor && (
                <Bar dataKey="motor" name="Sepeda Motor" fill="#10b981" radius={[4, 4, 0, 0]} />
              )}
              {activeSeries.mobil && (
                <Bar dataKey="mobil" name="Mobil Penumpang" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              )}
              {activeSeries.pejalanKaki && (
                <Bar dataKey="pejalanKaki" name="Pejalan Kaki" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              )}
              {activeSeries.truk && (
                <Bar dataKey="truk" name="Truk & Bus" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
