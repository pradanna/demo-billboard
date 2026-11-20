import React from 'react';
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

export interface CategoryDataPoint {
  name: string; // e.g. Billboard Name or Date
  motor: number;
  mobil: number;
  pejalanKaki: number;
  truk: number;
  total?: number;
}

interface TrafficCategoryChartProps {
  data: CategoryDataPoint[];
  layout?: 'horizontal' | 'vertical';
  stacked?: boolean;
  height?: number;
  className?: string;
  showLegend?: boolean;
}

const formatNumber = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toLocaleString('id-ID');
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((acc: number, cur: any) => acc + (cur.value || 0), 0);
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[160px]">
        <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex justify-between items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold font-mono text-slate-800">
              {entry.value?.toLocaleString('id-ID')}
            </span>
          </div>
        ))}
        {payload.length > 1 && (
          <div className="pt-1.5 border-t border-slate-100 flex justify-between items-center text-slate-900 font-bold">
            <span>Total:</span>
            <span className="text-blue-600 font-mono">{total.toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const TrafficCategoryChart: React.FC<TrafficCategoryChartProps> = ({
  data,
  layout = 'horizontal',
  stacked = false,
  height = 300,
  className = '',
  showLegend = true,
}) => {
  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          {layout === 'horizontal' ? (
            <>
              <XAxis
                dataKey="name"
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
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tickFormatter={formatNumber}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
          )}
          <Bar
            dataKey="motor"
            name="Motor"
            fill="#10b981"
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          />
          <Bar
            dataKey="mobil"
            name="Mobil"
            fill="#3b82f6"
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          />
          <Bar
            dataKey="pejalanKaki"
            name="Pejalan Kaki"
            fill="#f59e0b"
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
          />
          <Bar
            dataKey="truk"
            name="Truk & Bus"
            fill="#8b5cf6"
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? [4, 4, 0, 0] : [4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
