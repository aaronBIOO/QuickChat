import express, { Request, Response, NextFunction } from "express";
import {  updateProfile, logout } from "@/controllers/userController.js";
import { protectRoute } from "@/middleware/auth.js";
import { AuthRequest } from "@/types/auth.js";

const userRouter = express.Router();

const handleRequest = (handler: (req: AuthRequest, res: Response, next: NextFunction
  ) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthRequest, res, next);
  };
};

userRouter.post("/logout", protectRoute, handleRequest(logout));
userRouter.put("/update-profile", protectRoute, handleRequest(updateProfile));


export default userRouter;