import "express";

declare global {
  namespace Express {
    interface UserContext {
      userId: number;
      username: string;
      role: string;
      permissions: string[];
      linkedTeacherId?: number | null;
      linkedStudentId?: number | null;
      linkedParentId?: number | null;
    }

    interface Request {
      user?: UserContext;
      requestMeta?: {
        ipAddress: string | null;
      };
    }
  }
}

export {};
