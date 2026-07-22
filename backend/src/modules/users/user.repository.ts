import { PoolClient } from "pg";
import { query } from "../../config/database";

export interface UserRow {
  id: number;
  role_id: number;
  username: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  phone: string | null;
  email: string | null;
  profile_photo: string | null;
  is_active: boolean;
  must_change_password: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  role_name: string;
}

export const userRepository = {
  listUsers: () =>
    query<UserRow>(
      `SELECT u.id, u.role_id, u.username, u.first_name, u.middle_name, u.last_name, u.phone, u.email,
              u.profile_photo, u.is_active, u.must_change_password, u.last_login, u.created_at, u.updated_at,
              r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC`
    ),
  async getUserById(id: number): Promise<UserRow | null> {
    const rows = await query<UserRow>(
      `SELECT u.id, u.role_id, u.username, u.first_name, u.middle_name, u.last_name, u.phone, u.email,
              u.profile_photo, u.is_active, u.must_change_password, u.last_login, u.created_at, u.updated_at,
              r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [id]
    );
    return rows[0] ?? null;
  },
  async roleExists(roleId: number): Promise<boolean> {
    const rows = await query<{ id: number }>(`SELECT id FROM roles WHERE id = $1`, [roleId]);
    return Boolean(rows[0]);
  },
  async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    const rows = await query<{ id: number }>(
      `SELECT id FROM users WHERE username = $1 AND ($2::bigint IS NULL OR id <> $2)`,
      [username, excludeId ?? null]
    );
    return rows.length > 0;
  },
  async createUser(
    client: PoolClient,
    values: {
      roleId: number;
      username: string;
      passwordHash: string;
      firstName: string;
      middleName?: string;
      lastName: string;
      phone?: string;
      email?: string;
      profilePhoto?: string;
      isActive?: boolean;
      mustChangePassword?: boolean;
    }
  ): Promise<number> {
    const result = await client.query<{ id: number }>(
      `INSERT INTO users (
        role_id, username, password_hash, first_name, middle_name, last_name,
        phone, email, profile_photo, is_active, must_change_password
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        values.roleId,
        values.username,
        values.passwordHash,
        values.firstName,
        values.middleName ?? null,
        values.lastName,
        values.phone ?? null,
        values.email ?? null,
        values.profilePhoto ?? null,
        values.isActive ?? true,
        values.mustChangePassword ?? true
      ]
    );
    return result.rows[0].id;
  },
  async updateUser(
    client: PoolClient,
    id: number,
    values: Partial<{
      roleId: number;
      username: string;
      firstName: string;
      middleName: string;
      lastName: string;
      phone: string;
      email: string;
      profilePhoto: string;
      isActive: boolean;
      mustChangePassword: boolean;
    }>
  ): Promise<void> {
    await client.query(
      `UPDATE users
       SET role_id = COALESCE($2, role_id),
           username = COALESCE($3, username),
           first_name = COALESCE($4, first_name),
           middle_name = COALESCE($5, middle_name),
           last_name = COALESCE($6, last_name),
           phone = COALESCE($7, phone),
           email = COALESCE($8, email),
           profile_photo = COALESCE($9, profile_photo),
           is_active = COALESCE($10, is_active),
           must_change_password = COALESCE($11, must_change_password),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [
        id,
        values.roleId ?? null,
        values.username ?? null,
        values.firstName ?? null,
        values.middleName ?? null,
        values.lastName ?? null,
        values.phone ?? null,
        values.email ?? null,
        values.profilePhoto ?? null,
        values.isActive ?? null,
        values.mustChangePassword ?? null
      ]
    );
  }
};
