import { Response } from "express";
import { getAuth } from "@clerk/express";
import User from "@/models/user.model.js";
import {
  getUsersForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage,
} from "@/services/message.services.js";
import { io, userSocketMap } from "@/config/socket.js";


// Helper to get the Mongo user and clerkId from Clerk auth
async function getCurrentUser(req: any) {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) throw new Error("Unauthorized");

  const user = await User.findOne({ clerkId });
  if (!user) throw new Error("User not found");

  return { user, clerkId };
}


//  Get all users except the logged-in user 
export const getUsers = async (req: any, res: Response) => {
  try {
    const { clerkId } = await getCurrentUser(req);
    const { users, unseenMessages } = await getUsersForSidebar(clerkId);

    res.json({ success: true, users, unseenMessages });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message || "Failed to fetch users",
    });
  }
};


// Get messages between current user and selected user 
export const getUserMessages = async (req: any, res: Response) => {
  try {
    const { clerkId } = await getCurrentUser(req);
    const messages = await getMessages(clerkId, req.params.id);

    res.json({ success: true, messages });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message || "Failed to get messages",
    });
  }
};


// Mark message as seen 
export const markAsSeen = async (req: any, res: Response) => {
  try {
    await getCurrentUser(req); 
    await markMessageAsSeen(req.params.id);

    res.json({ success: true, message: "Message marked as seen" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message || "Failed to mark message as seen",
    });
  }
};


// Send a message 
export const sendUserMessage = async (req: any, res: Response) => {
  try {
    const { clerkId: senderClerkId } = await getCurrentUser(req);
    const receiverClerkId = req.params.id;
    const { text, image } = req.body;

    const newMessage = await sendMessage(senderClerkId, receiverClerkId, text, image);

    // Emit new message in real-time
    const receiverSockets = userSocketMap[receiverClerkId];
    if (receiverSockets) {
      // Emit to all of the receiver's sockets
      receiverSockets.forEach(socketId => {
        io.to(socketId).emit("newMessage", newMessage);
      });

      // Update sender as well if not the same socket
      const senderSockets = userSocketMap[senderClerkId];
      if (senderSockets) {
        senderSockets.forEach(socketId => {
          // Only emit to sender's other sockets
          if (!receiverSockets.has(socketId)) {
            io.to(socketId).emit("newMessage", newMessage);
          }
        });
      }
    }

    res.json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message || "Failed to send message",
    });
  }
};
