import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

export const protectRoute = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach the userId to the request for downstream use
    (req as any).userId = userId;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
