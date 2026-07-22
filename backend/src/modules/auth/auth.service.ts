import { withTransaction } from "../../config/database";
import { query } from "../../config/database";
import { writeAuditLog } from "../../utils/audit";
import { AuthenticationError, NotFoundError } from "../../utils/errors";
import { comparePassword, hashPassword } from "../../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { authRepository } from "./auth.repository";

export const authService = {
  async getLinkedProfileIds(userId: number) {
    const [teacherRows, studentRows, parentRows] = await Promise.all([
      query(`SELECT t.id FROM teachers t JOIN staff s ON s.id = t.staff_id WHERE s.user_id = $1 LIMIT 1`, [userId]),
      query(`SELECT id FROM students WHERE user_id = $1 LIMIT 1`, [userId]),
      query(`SELECT id FROM parents WHERE user_id = $1 LIMIT 1`, [userId]),
    ]);

    return {
      linkedTeacherId: teacherRows[0]?.id ?? null,
      linkedStudentId: studentRows[0]?.id ?? null,
      linkedParentId: parentRows[0]?.id ?? null,
    };
  },
  async login(username: string, password: string, ipAddress: string | null) {
    const user = await authRepository.findUserByUsername(username);
    if (!user) {
      throw new AuthenticationError("Invalid username or password");
    }

    if (!user.is_active) {
      throw new AuthenticationError("This account is inactive");
    }

    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError("Invalid username or password");
    }

    const permissions = await authRepository.getRolePermissions(user.role_id);
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role_name
    };

    await withTransaction(async (client) => {
      await authRepository.updateLastLogin(client, user.id);
      await writeAuditLog(client, {
        userId: user.id,
        action: "LOGIN",
        tableName: "users",
        recordId: user.id,
        ipAddress
      });
    });

    const linkedProfiles = await this.getLinkedProfileIds(user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        middleName: user.middle_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profile_photo,
        isActive: user.is_active,
        mustChangePassword: user.must_change_password,
        role: user.role_name,
        permissions,
        ...linkedProfiles
      },
      tokens: {
        accessToken: signAccessToken(tokenPayload),
        refreshToken: signRefreshToken(tokenPayload)
      }
    };
  },

  async refreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await authRepository.findUserById(payload.userId);
    if (!user || !user.is_active) {
      throw new AuthenticationError("Unable to refresh token");
    }

    return {
      accessToken: signAccessToken({
        userId: user.id,
        username: user.username,
        role: user.role_name
      })
    };
  },

  async getMe(userId: number) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("Authenticated user was not found");
    }

    const permissions = await authRepository.getRolePermissions(user.role_id);
    const linkedProfiles = await this.getLinkedProfileIds(user.id);

    return {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      middleName: user.middle_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      profilePhoto: user.profile_photo,
      isActive: user.is_active,
      mustChangePassword: user.must_change_password,
      lastLogin: user.last_login,
      role: user.role_name,
      permissions,
      ...linkedProfiles
    };
  },

  async logout(userId: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await writeAuditLog(client, {
        userId,
        action: "LOGOUT",
        tableName: "users",
        recordId: userId,
        ipAddress
      });
    });
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string, ipAddress: string | null) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const passwordMatches = await comparePassword(currentPassword, user.password_hash);
    if (!passwordMatches) {
      throw new AuthenticationError("Current password is incorrect");
    }

    const newPasswordHash = await hashPassword(newPassword);
    await withTransaction(async (client) => {
      await authRepository.updatePassword(client, userId, newPasswordHash);
      await writeAuditLog(client, {
        userId,
        action: "CHANGE_PASSWORD",
        tableName: "users",
        recordId: userId,
        ipAddress
      });
    });
  },

  async resetUserPassword(adminUserId: number, targetUserId: number, newPassword: string, ipAddress: string | null) {
    const targetUser = await authRepository.findUserById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError("Target user not found");
    }

    const passwordHash = await hashPassword(newPassword);
    await withTransaction(async (client) => {
      await authRepository.updatePassword(client, targetUserId, passwordHash);
      await writeAuditLog(client, {
        userId: adminUserId,
        action: "RESET_PASSWORD",
        tableName: "users",
        recordId: targetUserId,
        ipAddress
      });
    });
  }
};
