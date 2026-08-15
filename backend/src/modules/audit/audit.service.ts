import { Injectable, Inject } from '@nestjs/common';
import { PgConnection, SQL_CONNECTION } from '../../database/database.module';

export interface AuditEntry {
  action: string;
  entity: string;
  entityId?: string;
  actorId?: number | null;
  actorEmployeeId?: string | null;
  details?: Record<string, any>;
  ip?: string | null;
}

/**
 * Append-only audit trail.
 *
 * Every entry is written to `audit_logs` as a new row - rows are never updated
 * or deleted. The service deliberately swallows write errors: auditing must
 * never break the business operation it records.
 */
@Injectable()
export class AuditService {
  constructor(
    @Inject(SQL_CONNECTION)
    private readonly connection: PgConnection,
  ) {}

  async log(entry: AuditEntry): Promise<void> {
    try {
      await this.connection.execute(
        `INSERT INTO audit_logs (actor_id, actor_employee_id, action, entity, entity_id, details, ip)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
        [
          entry.actorId ?? null,
          entry.actorEmployeeId ?? null,
          entry.action,
          entry.entity,
          entry.entityId ?? null,
          JSON.stringify(entry.details ?? {}),
          entry.ip ?? null,
        ],
      );
    } catch (err) {
      // Log and continue - an audit failure must never take down a request.
      console.error('Audit log write failed:', (err as Error).message);
    }
  }
}
