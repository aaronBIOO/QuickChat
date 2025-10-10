import express from "express";
import {  updateProfile, logout } from "@/controllers/userController.js";
import { clerkMiddleware } from "@clerk/express";
import { attachClerkUser } from "@/middleware/clerkMiddleware.js";
import { syncUser } from "@/controllers/userController.js";

const userRouter = express.Router();

userRouter.use(clerkMiddleware(), attachClerkUser);
userRouter.get("/sync", syncUser); 
userRouter.put("/update-profile", updateProfile);
userRouter.post("/logout", logout);

export default userRouter;