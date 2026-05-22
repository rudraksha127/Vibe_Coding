import type { UserRole } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      sessionId: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
