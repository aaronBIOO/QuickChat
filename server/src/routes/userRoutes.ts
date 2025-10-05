import express, { Request, Response, NextFunction } from "express";
import { login, signup, checkAuth, updateProfile, logout } from "@/controllers/userController";
import { protectRoute } from "@/middleware/auth";
import { AuthRequest } from "@/types/auth";

const userRouter = express.Router();

const handleRequest = (handler: (req: AuthRequest, res: Response, next: NextFunction
  ) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthRequest, res, next);
  };
};

userRouter.post("/signup", handleRequest(signup));
userRouter.post("/login", handleRequest(login));

userRouter.post("/logout", protectRoute, handleRequest(logout));
userRouter.put("/update-profile", protectRoute, handleRequest(updateProfile));
userRouter.get("/check", protectRoute, handleRequest(checkAuth));

export default userRouter;