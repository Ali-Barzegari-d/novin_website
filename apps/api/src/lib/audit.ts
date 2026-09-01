import { auditLogs } from '@novin/db';
import type { Database } from '@novin/db';

export async function audit(db: Database, entry: { actorId?: string; actorRole?: string; action: string; entity: string; entityId?: string; before?: Record<string, unknown>; after?: Record<string, unknown>; reason?: string; correlationId?: string; ipHash?: string }) {
  await db.insert(auditLogs).values({ actorId: entry.actorId, actorRole: entry.actorRole, action: entry.action, entity: entry.entity, entityId: entry.entityId, before: entry.before, after: entry.after, reason: entry.reason, correlationId: entry.correlationId, ipHash: entry.ipHash });
}
