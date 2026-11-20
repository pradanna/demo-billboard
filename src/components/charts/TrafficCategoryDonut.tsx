import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { TrafficRecord } from '../../types';

export interface TrafficCategoryDonutProps {
  records: TrafficRecord[];
  height?: number;
  className?: string;
}

export const TrafficCategoryDonut: React.FC<TrafficCategoryDonutProps> = ({
  records,
  height = 240,
  className = ''
}) => {
  // Aggregate total traffic across records
  const totals = records.reduce(
    (acc, cur) => {
      acc.motor += cur.motor;
      acc.mobil += cur.mobil;
      acc.pejalanKaki += cur.pejalanKaki;
      acc.truk += cur.truk;
      return acc;
    },
    { motor: 0, mobil: 0, pejalanKaki: 0, truk: 0 }
  );

  const grandTotal = totals.motor + totals.mobil + totals.pejalanKaki + totals.truk;

  const data = [
    { name: 'Sepeda Motor', value: totals.motor, color: '#10b981', desc: 'Roda 2' },
    { name: 'Mobil Penumpang', value: totals.mobil, color: '#3b82f6', desc: 'Roda 4' },
    { name: 'Pejalan Kaki', value: totals.pejalanKaki, color: '#f59e0b', desc: 'Footfall' },
    { name: 'Truk & Bus', value: totals.truk, color: '#8b5cf6', desc: 'Kargo / Berat' }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = grandTotal > 0 ? ((item.value / grandTotal) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-2.5 shadow-lg text-xs z-50">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: item.payload.color }}
            />
            <span className="font-bold text-slate-900">{item.name}</span>
          </div>
          <div className="text-slate-600 font-mono">
            {Number(item.value).toLocaleString('id-ID')} unit ({pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Donut Chart Canvas */}
      <div className="relative w-full sm:w-1/2 flex items-center justify-center" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              stroke="transparent"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label inside donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
          <span className="text-sm font-extrabold text-slate-900 font-mono">
            {grandTotal >= 1000000
              ? `${(grandTotal / 1000000).toFixed(1)}M`
              : `${(grandTotal / 1000).toFixed(0)}k`}
          </span>
        </div>
      </div>

      {/* Legend & Breakdown stats */}
      <div className="w-full sm:w-1/2 space-y-2 text-xs">
        {data.map((item) => {
          const pct = grandTotal > 0 ? ((item.value / grandTotal) * 100).toFixed(1) : '0';
          return (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <div className="font-semibold text-slate-800 leading-tight">{item.name}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-slate-900 font-mono">{pct}%</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {Number(item.value).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
