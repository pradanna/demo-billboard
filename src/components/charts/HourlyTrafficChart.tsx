import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export interface HourlyTrafficChartProps {
  dailyTraffic: number;
  height?: number;
  className?: string;
}

export const HourlyTrafficChart: React.FC<HourlyTrafficChartProps> = ({
  dailyTraffic,
  height = 200,
  className = ''
}) => {
  // Realistic hourly distribution curve weights for urban Indonesia traffic
  // Peaks: Morning (07:00-09:00), Lunch (12:00-13:00), Evening Peak (17:00-20:00)
  const hourlyWeights: { [hour: string]: number } = {
    '00:00': 0.010,
    '02:00': 0.006,
    '04:00': 0.012,
    '06:00': 0.045,
    '07:00': 0.082, // Morning rush
    '08:00': 0.095, // Peak morning
    '09:00': 0.065,
    '10:00': 0.050,
    '11:00': 0.052,
    '12:00': 0.068, // Lunch rush
    '13:00': 0.055,
    '14:00': 0.052,
    '15:00': 0.060,
    '16:00': 0.075,
    '17:00': 0.098, // Evening rush
    '18:00': 0.105, // Peak evening prime
    '19:00': 0.088,
    '20:00': 0.062,
    '21:00': 0.045,
    '22:00': 0.030,
    '23:00': 0.018
  };

  const data = Object.entries(hourlyWeights).map(([jam, weight]) => {
    const volume = Math.round(dailyTraffic * weight);
    const isPrime = weight >= 0.08; // Jam sibuk / prime time
    return {
      jam,
      volume,
      isPrime
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-2.5 shadow-lg text-xs z-50">
          <div className="font-bold text-slate-900 mb-1 flex items-center justify-between gap-2">
            <span>Pukul {item.jam}</span>
            {item.isPrime && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Jam Sibuk (Prime)
              </span>
            )}
          </div>
          <div className="text-slate-600">
            Estimasi Lalu Lintas: <span className="font-bold text-slate-900 font-mono">{item.volume.toLocaleString('id-ID')}</span> kendaraan
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-slate-500 text-[11px]">Estimasi Profil Kepadatan per Jam (24 Jam)</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-2 h-2 rounded bg-blue-400 inline-block" /> Reguler
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-700">
            <span className="w-2 h-2 rounded bg-amber-500 inline-block" /> Jam Sibuk / Prime Time
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="jam"
              tick={{ fill: '#64748b', fontSize: 10 }}
              stroke="#cbd5e1"
              tickLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 10 }}
              stroke="#cbd5e1"
              tickLine={false}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="volume" radius={[3, 3, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPrime ? '#f59e0b' : '#60a5fa'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
