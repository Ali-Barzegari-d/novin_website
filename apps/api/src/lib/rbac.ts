import type { StaffRole } from '@novin/contracts';

export type Permission = 'requests:read' | 'requests:screen' | 'requests:assign' | 'requests:export' | 'offers:manage' | 'payments:review' | 'payments:refund' | 'content:manage' | 'settings:manage' | 'staff:manage' | 'audit:read' | 'errors:read';

const matrix: Record<StaffRole | 'CUSTOMER', readonly Permission[]> = {
  CUSTOMER: [],
  EXPERT: ['requests:read', 'requests:screen'],
  OPERATIONS: ['requests:read', 'requests:screen', 'requests:assign', 'requests:export', 'offers:manage'],
  FINANCE: ['requests:read', 'payments:review', 'payments:refund'],
  CONTENT: ['content:manage'],
  SUPERADMIN: ['requests:read', 'requests:screen', 'requests:assign', 'requests:export', 'offers:manage', 'payments:review', 'payments:refund', 'content:manage', 'settings:manage', 'staff:manage', 'audit:read', 'errors:read']
};

export function can(role: StaffRole | 'CUSTOMER', permission: Permission) {
  return matrix[role].includes(permission);
}

export const authorizationMatrix = matrix;
