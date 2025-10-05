import { Response } from "express";
import { AuthRequest } from "@/types/auth";
import {
  getUsersForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage,
} from "@/services/messageServices";
import { io, userSocketMap } from "@/config/socket";



// get all users except the logged-in user
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { users, unseenMessages } = await getUsersForSidebar(req.user!._id);
    res.json({ success: true, users, unseenMessages });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message || "Failed to fetch users",
    });
  }
};


// get all messages between current user and selected user
export const getUserMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await getMessages(req.user!._id, req.params.id);
    res.json({ success: true, messages });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message || "Failed to get messages",
    });
  }
};


// mark message as seen
export const markAsSeen = async (req: AuthRequest, res: Response) => {
  try {
    await markMessageAsSeen(req.params.id);
    res.json({ success: true, message: "Message marked as seen" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message || "Failed to mark message as seen",
    });
  }
};


// send a message or image
export const sendUserMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user!._id;
    const receiverId = req.params.id;

    const { text, image } = req.body;
    const newMessage = await sendMessage(senderId, receiverId, text, image);

    // Emit new message in real time to receiver
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);

      // Also emit to sender to update unseen message count
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId && senderSocketId !== receiverSocketId) {
        io.to(senderSocketId).emit("newMessage", newMessage);
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
