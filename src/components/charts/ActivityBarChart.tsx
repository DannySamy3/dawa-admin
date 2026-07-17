'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BarData {
  name: string;
  count: number;
}

interface ActivityBarChartProps {
  data: BarData[];
}

export function ActivityBarChart({ data }: ActivityBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(13,21,40,0.95)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '13px',
          }}
          cursor={{ fill: 'rgba(99,102,241,0.06)' }}
        />
        <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
