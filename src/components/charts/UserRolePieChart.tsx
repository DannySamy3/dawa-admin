'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#f43f5e'];

interface RoleData {
  name: string;
  value: number;
}

interface UserRolePieChartProps {
  data: RoleData[];
}

export function UserRolePieChart({ data }: UserRolePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'rgba(13,21,40,0.95)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '13px',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
