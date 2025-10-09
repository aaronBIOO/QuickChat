import { Response, NextFunction } from "express";
import { AuthRequest } from "@/types/auth.js";


export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  res.status(501).json({ 
    success: false, 
    message: "The custom refresh-token route has been disabled." 
});
};
