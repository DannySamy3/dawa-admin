import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  iconBg: string;
  change?: string;
}

export function StatCard({ label, value, icon, iconBg, change }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-icon" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      {change && <div className="stat-card-change">{change}</div>}
    </div>
  );
}
