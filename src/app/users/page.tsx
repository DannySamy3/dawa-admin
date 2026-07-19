'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, Power, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Pagination } from '@/components/ui/Pagination';
import { Modal } from '@/components/ui/Modal';
import { roleBadge, statusBadge } from '@/components/ui/Badge';
import { adminApi } from '@/lib/api';
import type { User } from '@/lib/types';

const ROLES = ['ALL', 'ADMIN', 'IMPORTER', 'DISTRIBUTOR', 'MANUFACTURER', 'INSTITUTION', 'COMMUNITY'];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const LIMIT = 10;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers(page, LIMIT, roleFilter === 'ALL' ? undefined : roleFilter);
      const list: User[] = data.users ?? data.data ?? data ?? [];
      const pagination = data.pagination;
      setUsers(list);
      setTotal(pagination?.total ?? list.length);
      setTotalPages(pagination?.totalPages ?? 1);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, [page, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { setPage(1); }, [roleFilter]);

  const handleToggle = async (userId: string) => {
    setToggling(userId);
    try {
      const { data } = await adminApi.toggleUserStatus(userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isActive: data.isActive } : u));
      if (selectedUser?.id === userId) setSelectedUser((prev) => prev ? { ...prev, isActive: data.isActive } : prev);
    } catch { /* silent */ } finally { setToggling(null); }
  };

  const filtered = users.filter((u) =>
    search === '' ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-title">User Management</div>
          <div className="page-subtitle">{total.toLocaleString()} total users registered</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary btn-sm" onClick={loadUsers}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrap">
          <Search size={16} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          {ROLES.map((r) => <option key={r} value={r}>{r === 'ALL' ? 'All Roles' : r}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                      <div className="skeleton" style={{ width: 100, height: 14 }} />
                    </div>
                  </td>
                  <td><div className="skeleton" style={{ width: 150, height: 14 }} /></td>
                  <td><div className="skeleton" style={{ width: 80, height: 18, borderRadius: 10 }} /></td>
                  <td><div className="skeleton" style={{ width: 60, height: 18, borderRadius: 10 }} /></td>
                  <td><div className="skeleton" style={{ width: 80, height: 14 }} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }} />
                      <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)' }} />
                    </div>
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <UserX size={36} />
                  <p>No users found</p>
                </div>
              </td></tr>
            ) : filtered.map((user) => (
              <tr key={user.id}>
                <td>
                  <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                    <div className="sidebar-avatar" style={{ width:32,height:32,fontSize:12 }}>
                      {user.name?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="table-name">{user.name}</span>
                  </div>
                </td>
                <td><span className="table-email">{user.email}</span></td>
                <td>{roleBadge(user.role)}</td>
                <td>{statusBadge(user.isActive)}</td>
                <td style={{ color:'var(--text-muted)', fontSize:12 }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <div style={{ display:'flex',gap:6 }}>
                    <button className="btn btn-secondary btn-sm btn-icon" title="View" onClick={() => setSelectedUser(user)}>
                      <Eye size={14} />
                    </button>
                    <button
                      className={`btn btn-sm btn-icon ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggle(user.id)}
                      disabled={toggling === user.id}
                    >
                      {toggling === user.id ? <span className="skeleton" style={{ width:12,height:12,borderRadius:'50%' }} /> : <Power size={14} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPage={setPage} />
      </div>

      {/* Detail Modal */}
      <Modal title="User Details" open={!!selectedUser} onClose={() => setSelectedUser(null)}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Close</button>
            {selectedUser && (
              <button
                className={`btn ${selectedUser.isActive ? 'btn-danger' : 'btn-success'}`}
                onClick={() => handleToggle(selectedUser.id)}
                disabled={toggling === selectedUser.id}
              >
                {selectedUser.isActive ? <><UserX size={14}/> Deactivate</> : <><UserCheck size={14}/> Activate</>}
              </button>
            )}
          </>
        }
      >
        {selectedUser && (
          <div style={{ display:'flex',flexDirection:'column',gap:20 }}>
            <div style={{ display:'flex',alignItems:'center',gap:14 }}>
              <div className="user-avatar-lg">{selectedUser.name?.[0]?.toUpperCase() ?? '?'}</div>
              <div>
                <div style={{ fontSize:18,fontWeight:700,color:'var(--text-primary)' }}>{selectedUser.name}</div>
                <div style={{ fontSize:13,color:'var(--text-muted)',marginTop:2 }}>{selectedUser.email}</div>
                <div style={{ marginTop:6,display:'flex',gap:8 }}>
                  {roleBadge(selectedUser.role)}
                  {statusBadge(selectedUser.isActive)}
                </div>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-row">
                <div className="detail-label">User ID</div>
                <div className="detail-value" style={{ fontSize:12,fontFamily:'monospace',wordBreak:'break-all' }}>{selectedUser.id}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Role</div>
                <div className="detail-value">{selectedUser.role}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Member Since</div>
                <div className="detail-value">{new Date(selectedUser.createdAt).toLocaleDateString('en-US', { year:'numeric',month:'long',day:'numeric' })}</div>
              </div>
              <div className="detail-row">
                <div className="detail-label">Last Updated</div>
                <div className="detail-value">{new Date(selectedUser.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
