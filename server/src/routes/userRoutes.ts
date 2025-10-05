import express from "express";
import { login, signup, checkAuth, updateProfile, logout } from "@/controllers/userController"
import { protectRoute } from "@/middleware/auth";


const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/logout", protectRoute, logout);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;