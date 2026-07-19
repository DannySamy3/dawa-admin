'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  Factory,
  Building2,
  HeartPulse,
  Settings,
  ShieldCheck,
  Inbox,
  MessageSquare,
  Leaf,
} from 'lucide-react';
import type { User } from '@/lib/types';

const navItems = [
  { label: 'Main', items: [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ]},
  { label: 'Users & Approvals', items: [
    { href: '/requests', icon: Inbox, label: 'Pending Requests' },
    { href: '/users', icon: Users, label: 'All Users' },
    { href: '/importers', icon: Package, label: 'Importers' },
    { href: '/distributors', icon: Truck, label: 'Distributors' },
    { href: '/manufacturers', icon: Factory, label: 'Manufacturers' },
    { href: '/institutions', icon: Building2, label: 'Institutions' },
    { href: '/organics', icon: Leaf, label: 'Organics & Supplements' },
  ]},
  { label: 'Platform', items: [
    { href: '/community', icon: HeartPulse, label: 'Community' },
    { href: '/posts', icon: MessageSquare, label: 'Posts' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]},
];

interface SidebarProps {
  user: User | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <ShieldCheck size={20} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <strong>Smart Health Admin</strong>
          <span>Control Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((section) => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name ?? 'Admin'}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
