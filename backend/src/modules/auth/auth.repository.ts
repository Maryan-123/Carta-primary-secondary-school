import { PoolClient } from "pg";
import { query } from "../../config/database";

export interface AuthUserRow {
  id: number;
  role_id: number;
  username: string;
  password_hash: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string | null;
  phone: string | null;
  profile_photo: string | null;
  is_active: boolean;
  must_change_password: boolean;
  last_login: string | null;
  role_name: string;
}

export interface PermissionRow {
  permission_name: string;
}

export const authRepository = {
  async findUserByUsername(username: string): Promise<AuthUserRow | null> {
    const rows = await query<AuthUserRow>(
      `SELECT u.*, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.username = $1
       LIMIT 1`,
      [username]
    );
    return rows[0] ?? null;
  },

  async findUserById(userId: number): Promise<AuthUserRow | null> {
    const rows = await query<AuthUserRow>(
      `SELECT u.*, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1
       LIMIT 1`,
      [userId]
    );
    return rows[0] ?? null;
  },

  async getRolePermissions(roleId: number): Promise<string[]> {
    const rows = await query<PermissionRow>(
      `SELECT p.name AS permission_name
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       WHERE rp.role_id = $1
       ORDER BY p.module, p.name`,
      [roleId]
    );
    return rows.map((row) => row.permission_name);
  },

  async updateLastLogin(client: PoolClient, userId: number): Promise<void> {
    await client.query(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`, [userId]);
  },

  async updatePassword(client: PoolClient, userId: number, passwordHash: string): Promise<void> {
    await client.query(
      `UPDATE users
       SET password_hash = $2,
           must_change_password = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId, passwordHash]
    );
  }
};
