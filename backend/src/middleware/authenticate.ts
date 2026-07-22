import { NextFunction, Request, Response } from "express";
import { query } from "../config/database";
import { AuthenticationError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

interface PermissionRow {
  permission_name: string;
}

interface UserRow {
  id: number;
  username: string;
  role_name: string;
  is_active: boolean;
}

export const authenticate = async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
  try {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new AuthenticationError("Missing or invalid authorization header");
    }

    const token = header.replace("Bearer ", "");
    const payload = verifyAccessToken(token);

    const users = await query<UserRow>(
      `SELECT u.id, u.username, u.is_active, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [payload.userId]
    );

    const user = users[0];
    if (!user || !user.is_active) {
      throw new AuthenticationError("User account is inactive or missing");
    }

    const [permissionRows, teacherLinks, studentLinks, parentLinks] = await Promise.all([
      query<PermissionRow>(
        `SELECT p.name AS permission_name
         FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = (
           SELECT role_id FROM users WHERE id = $1
         )`,
        [user.id]
      ),
      query<{ id: number }>(
        `SELECT t.id
         FROM teachers t
         JOIN staff s ON s.id = t.staff_id
         WHERE s.user_id = $1
         LIMIT 1`,
        [user.id]
      ),
      query<{ id: number }>(`SELECT id FROM students WHERE user_id = $1 LIMIT 1`, [user.id]),
      query<{ id: number }>(`SELECT id FROM parents WHERE user_id = $1 LIMIT 1`, [user.id])
    ]);

    request.user = {
      userId: user.id,
      username: user.username,
      role: user.role_name,
      permissions: permissionRows.map((row) => row.permission_name),
      linkedTeacherId: teacherLinks[0]?.id ?? null,
      linkedStudentId: studentLinks[0]?.id ?? null,
      linkedParentId: parentLinks[0]?.id ?? null
    };

    next();
  } catch (error) {
    next(error);
  }
};
