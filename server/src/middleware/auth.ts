import { Request, Response, NextFunction } from "express";
import { requireAuth as clerkRequireAuth, getAuth } from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireAuth = clerkRequireAuth();

export const protectRoute = [
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      req.userId = userId;
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
];
