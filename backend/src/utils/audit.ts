import { PoolClient } from "pg";

export interface AuditPayload {
  userId?: number | null;
  action: string;
  tableName?: string | null;
  recordId?: number | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export const writeAuditLog = async (client: PoolClient, payload: AuditPayload): Promise<void> => {
  await client.query(
    `INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      payload.userId ?? null,
      payload.action,
      payload.tableName ?? null,
      payload.recordId ?? null,
      payload.oldValues ?? null,
      payload.newValues ?? null,
      payload.ipAddress ?? null
    ]
  );
};
