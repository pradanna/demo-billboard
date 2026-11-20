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
import { Bike, Car, Footprints, Truck, BarChart3, LineChart } from 'lucide-react';

interface TrafficChartProps {
  data: TrafficRecord[];
  height?: number;
  showModeToggle?: boolean;
  className?: string;
}

export const TrafficChart: React.FC<TrafficChartProps> = ({
  data,
  height = 280,
  showModeToggle = true,
  className = ''
}) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Format dates for chart labels (e.g., "18 Nov")
  const formattedData = data.map((item) => {
    const dateObj = new Date(item.tanggal);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleDateString('id-ID', { month: 'short' });
    return {
      ...item,
      label: `${day} ${month}`,
      total: (item.motor || 0) + (item.mobil || 0) + (item.pejalanKaki || 0) + (item.truk || 0)
    };
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toLocaleString('id-ID');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (Number(entry.value) || 0), 0);
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200 text-xs min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <span className="font-bold text-slate-800">{label}</span>
            <span className="font-extrabold text-blue-600">
              Total: {total.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              const iconMap: Record<string, React.ReactNode> = {
                motor: <Bike className="w-3.5 h-3.5 text-emerald-500" />,
                mobil: <Car className="w-3.5 h-3.5 text-blue-500" />,
                pejalanKaki: <Footprints className="w-3.5 h-3.5 text-amber-500" />,
                truk: <Truck className="w-3.5 h-3.5 text-purple-500" />
              };
              const labelMap: Record<string, string> = {
                motor: 'Sepeda Motor',
                mobil: 'Mobil Penumpang',
                pejalanKaki: 'Pejalan Kaki',
                truk: 'Truk & Bus'
              };
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {iconMap[entry.dataKey] || (
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    )}
                    <span>{labelMap[entry.dataKey] || entry.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {Number(entry.value).toLocaleString('id-ID')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header controls (chart type toggle) */}
      {showModeToggle && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium">Tampilan Grafik:</span>
          </div>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                chartType === 'area'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChart className="w-3 h-3" />
              <span>Area Trend</span>
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all ${
                chartType === 'bar'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Stacked Bar</span>
            </button>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMotor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorMobil" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="motor" name="Sepeda Motor" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMotor)" stackId="1" />
              <Area type="monotone" dataKey="mobil" name="Mobil Penumpang" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorMobil)" stackId="1" />
              <Area type="monotone" dataKey="pejalanKaki" name="Pejalan Kaki" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPejalan)" stackId="1" />
              <Area type="monotone" dataKey="truk" name="Truk & Bus" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorTruk)" stackId="1" />
            </AreaChart>
          ) : (
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={formatNumber} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="motor" name="Sepeda Motor" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="mobil" name="Mobil Penumpang" fill="#2563eb" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pejalanKaki" name="Pejalan Kaki" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="truk" name="Truk & Bus" fill="#8b5cf6" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend Badge Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-600">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Motor
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          Mobil
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          Pejalan Kaki
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          Truk / Bus
        </span>
      </div>
    </div>
  );
};