import { z } from "zod";

export const replaceRolePermissionsSchema = z.object({
  permissionIds: z.array(z.number().int().positive()).min(1)
});
