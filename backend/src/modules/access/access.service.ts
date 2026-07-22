import { withTransaction } from "../../config/database";
import { writeAuditLog } from "../../utils/audit";
import { NotFoundError } from "../../utils/errors";
import { accessRepository } from "./access.repository";

export const accessService = {
  async listRoles() {
    return accessRepository.listRoles();
  },

  async getRole(id: number) {
    const role = await accessRepository.getRoleById(id);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    return role;
  },

  async listPermissions() {
    return accessRepository.listPermissions();
  },

  async listPermissionsGrouped() {
    const permissions = await accessRepository.listPermissions();
    return permissions.reduce<Record<string, typeof permissions>>((accumulator, permission) => {
      const group = accumulator[permission.module] ?? [];
      group.push(permission);
      accumulator[permission.module] = group;
      return accumulator;
    }, {});
  },

  async getRolePermissions(roleId: number) {
    const role = await accessRepository.getRoleById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }
    return accessRepository.getRolePermissions(roleId);
  },

  async replaceRolePermissions(
    actorUserId: number,
    roleId: number,
    permissionIds: number[],
    ipAddress: string | null
  ) {
    const role = await accessRepository.getRoleById(roleId);
    if (!role) {
      throw new NotFoundError("Role not found");
    }

    const permissions = await accessRepository.listPermissions();
    const validPermissionIds = new Set(permissions.map((permission) => permission.id));
    for (const permissionId of permissionIds) {
      if (!validPermissionIds.has(permissionId)) {
        throw new NotFoundError(`Permission ${permissionId} does not exist`);
      }
    }

    await withTransaction(async (client) => {
      await accessRepository.replaceRolePermissions(client, roleId, permissionIds);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "REPLACE_ROLE_PERMISSIONS",
        tableName: "role_permissions",
        recordId: roleId,
        newValues: { permissionIds },
        ipAddress
      });
    });

    return accessRepository.getRolePermissions(roleId);
  }
};
