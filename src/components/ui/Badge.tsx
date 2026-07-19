type BadgeVariant = 'active' | 'inactive' | 'pending' | 'primary' | 'secondary' | 'info' | 'success' | 'danger' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Badge({ variant = 'primary', children, style }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`} style={style}>{children}</span>
  );
}

export function roleBadge(role: string) {
  const map: Record<string, BadgeVariant> = {
    ADMIN: 'danger',
    IMPORTER: 'primary',
    DISTRIBUTOR: 'info',
    MANUFACTURER: 'warning',
    INSTITUTION: 'success',
    COMMUNITY: 'primary',
    ORGANICSSUPPLEMENT: 'success',
  };
  return <Badge variant={map[role] ?? 'primary'}>{role}</Badge>;
}

export function statusBadge(isActive: boolean) {
  return <Badge variant={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
}

export function verifyBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    PENDING: 'pending',
    VERIFIED: 'success',
    APPROVED: 'success',
    REJECTED: 'danger',
  };
  return <Badge variant={map[status] ?? 'primary'}>{status}</Badge>;
}
