import { PoolClient } from "pg";
import { query } from "../../config/database";

export interface RoleRow {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PermissionRow {
  id: number;
  name: string;
  module: string;
  description: string | null;
  created_at: string;
}

export const accessRepository = {
  listRoles: () => query<RoleRow>(`SELECT * FROM roles ORDER BY name`),
  getRoleById: async (id: number) => (await query<RoleRow>(`SELECT * FROM roles WHERE id = $1`, [id]))[0] ?? null,
  listPermissions: () => query<PermissionRow>(`SELECT * FROM permissions ORDER BY module, name`),
  getRolePermissions: (roleId: number) =>
    query<PermissionRow>(
      `SELECT p.*
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = $1
       ORDER BY p.module, p.name`,
      [roleId]
    ),
  async replaceRolePermissions(client: PoolClient, roleId: number, permissionIds: number[]): Promise<void> {
    await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
    for (const permissionId of permissionIds) {
      await client.query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`, [
        roleId,
        permissionId
      ]);
    }
  }
};
