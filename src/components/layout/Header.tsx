'use client';

import { LogOut } from 'lucide-react';
import type { User } from '@/lib/types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  user: User | null;
  onLogout: () => void;
  apiOnline?: boolean;
}

export function Header({ title, subtitle, user: _user, onLogout, apiOnline = true }: HeaderProps) {
  return (
    <header className="admin-header">
      <div>
        <div className="header-title">{title}</div>
        {subtitle && <div className="header-subtitle">{subtitle}</div>}
      </div>

      <div className="header-actions">
        <div className="header-status">
          <div className="header-status-dot" style={{ background: apiOnline ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
          {apiOnline ? 'API Online' : 'API Offline'}
        </div>

        <button className="btn btn-secondary btn-sm" onClick={onLogout} title="Logout">
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </header>
  );
}
