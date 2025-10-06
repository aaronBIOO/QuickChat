import express, { type RequestHandler } from "express";
import { protectRoute } from "@/middleware/auth.js";
import {
  getUsers, 
  getUserMessages, 
  markAsSeen, 
  sendUserMessage 
} from "@/controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsers);
messageRouter.get("/users/:id", protectRoute, getUserMessages);
messageRouter.put("/mark/:id", protectRoute, markAsSeen);
messageRouter.post("/send/:id", protectRoute, sendUserMessage);

export default messageRouter;
