import express, { type RequestHandler } from "express";
import { protectRoute } from "@/middleware/auth";
import {
  getUsersForSidebar, 
  getMessages, 
  markMessageAsSeen, 
  sendMessage 
} from "@/controllers/messageController";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar as RequestHandler);
messageRouter.get("/:id", protectRoute, getMessages as RequestHandler);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen as RequestHandler);
messageRouter.post("/send/:id", protectRoute, sendMessage as RequestHandler);

export default messageRouter;
