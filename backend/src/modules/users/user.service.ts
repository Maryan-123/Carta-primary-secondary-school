import { withTransaction } from "../../config/database";
import { writeAuditLog } from "../../utils/audit";
import { ConflictError, NotFoundError } from "../../utils/errors";
import { hashCreateUserPassword } from "../../utils/password";
import { userRepository } from "./user.repository";

export const userService = {
  async listUsers() {
    return userRepository.listUsers();
  },

  async getUser(id: number) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },

  async createUser(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    if (!(await userRepository.roleExists(Number(payload.roleId)))) {
      throw new NotFoundError("Role does not exist");
    }

    if (await userRepository.usernameExists(String(payload.username))) {
      throw new ConflictError("Username already exists");
    }

    const passwordHash = await hashCreateUserPassword(String(payload.password));
    const userId = await withTransaction(async (client) => {
      const createdUserId = await userRepository.createUser(client, {
        roleId: Number(payload.roleId),
        username: String(payload.username),
        passwordHash,
        firstName: String(payload.firstName),
        middleName: payload.middleName ? String(payload.middleName) : undefined,
        lastName: String(payload.lastName),
        phone: payload.phone ? String(payload.phone) : undefined,
        email: payload.email ? String(payload.email) : undefined,
        profilePhoto: payload.profilePhoto ? String(payload.profilePhoto) : undefined,
        isActive: payload.isActive === undefined ? true : Boolean(payload.isActive),
        mustChangePassword: payload.mustChangePassword === undefined ? true : Boolean(payload.mustChangePassword)
      });

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_USER",
        tableName: "users",
        recordId: createdUserId,
        newValues: {
          username: payload.username,
          roleId: payload.roleId
        },
        ipAddress
      });

      return createdUserId;
    });

    return this.getUser(userId);
  },

  async updateUser(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const existing = await userRepository.getUserById(id);
    if (!existing) {
      throw new NotFoundError("User not found");
    }

    if (payload.roleId && !(await userRepository.roleExists(Number(payload.roleId)))) {
      throw new NotFoundError("Role does not exist");
    }

    if (payload.username && (await userRepository.usernameExists(String(payload.username), id))) {
      throw new ConflictError("Username already exists");
    }

    await withTransaction(async (client) => {
      await userRepository.updateUser(client, id, {
        roleId: payload.roleId ? Number(payload.roleId) : undefined,
        username: payload.username ? String(payload.username) : undefined,
        firstName: payload.firstName ? String(payload.firstName) : undefined,
        middleName: payload.middleName ? String(payload.middleName) : undefined,
        lastName: payload.lastName ? String(payload.lastName) : undefined,
        phone: payload.phone ? String(payload.phone) : undefined,
        email: payload.email ? String(payload.email) : undefined,
        profilePhoto: payload.profilePhoto ? String(payload.profilePhoto) : undefined,
        isActive: typeof payload.isActive === "boolean" ? Boolean(payload.isActive) : undefined,
        mustChangePassword:
          typeof payload.mustChangePassword === "boolean" ? Boolean(payload.mustChangePassword) : undefined
      });

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_USER",
        tableName: "users",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });

    return this.getUser(id);
  },

  async updateUserStatus(actorUserId: number, id: number, isActive: boolean, ipAddress: string | null) {
    return this.updateUser(actorUserId, id, { isActive }, ipAddress);
  },

  async deleteUser(actorUserId: number, id: number, ipAddress: string | null) {
    if (actorUserId === id) {
      throw new ConflictError("You cannot delete your own active account");
    }
    await this.updateUser(actorUserId, id, { isActive: false }, ipAddress);
  }
};
