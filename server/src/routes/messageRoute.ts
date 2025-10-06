import express, { type RequestHandler } from "express";
import { protectRoute } from "@/middleware/auth";
import {
  getUsers, 
  getUserMessages, 
  markAsSeen, 
  sendUserMessage 
} from "@/controllers/messageController";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsers);
messageRouter.get("/users/:id", protectRoute, getUserMessages);
messageRouter.put("/mark/:id", protectRoute, markAsSeen);
messageRouter.post("/send/:id", protectRoute, sendUserMessage);

export default messageRouter;
