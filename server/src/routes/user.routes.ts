import express from "express";
import {  updateProfile, logout } from "@/controllers/user.controller.js";
import { clerkMiddleware } from "@clerk/express";
import { attachClerkUser } from "@/middleware/clerkUser.middleware.js";
import { syncUser } from "@/controllers/user.controller.js";

const userRouter = express.Router();

userRouter.use(clerkMiddleware(), attachClerkUser);
userRouter.get("/sync", syncUser); 
userRouter.put("/update-profile", updateProfile);
userRouter.post("/logout", logout);

export default userRouter;