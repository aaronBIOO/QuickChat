import Message from "@/models/message";
import User from "@/models/user";
import { Response } from "express";
import { ExpressRequest } from "@/middleware/auth";
import cloudinary from "@/config/cloudinary";
import { Server } from "socket.io";


declare global {
  var io: Server;
  var userSocketMap: { [userId: string]: string };
}

type AuthenticatedRequest = ExpressRequest & {
  user: {
    _id: string | any; 
  };
};


// get all users except the logged in user
export const getUsersForSidebar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id.toString();
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password").lean();

    // count number of messages not seen
    const unseenMessages: { [key: string]: number } = {}
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({ 
        senderId: userId, 
        receiverId: user._id.toString(), 
        seen: false 
      });
      if (messages.length > 0) {
        unseenMessages[user._id.toString()] = messages.length;
      }
    });
    await Promise.all(promises);
    res.json({success: true, users: filteredUsers, unseenMessages});

  } catch (error: unknown) {
    console.error(error);
    res.json({
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to get users'
    })
  }
}


// get all messages for selected user
export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id.toString();
    const messages = await Message.find({
      $or: [
        {senderId: myId, receiverId: selectedUserId},
        {senderId: selectedUserId, receiverId: myId}
      ]
    });
    
    await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});
    res.json({
      success: true, 
      messages
    });

  } catch (error: unknown) {
    console.error(error);
    res.json({
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to get messages'
    });
  }
}


// mark message as seen using message id
export const markMessageAsSeen = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, {seen: true});
    res.json({success: true, message: "Message marked as seen"});

  } catch (error: unknown) {
    console.error(error);
    res.json({
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to mark message as seen'
    });
  }
}


// send message to selected user
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id.toString();
    
    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl
    });

    // Emit the new message to the receiver's socket
    const receiverSocketId = global.userSocketMap[receiverId];
    if (receiverSocketId) {
      global.io.to(receiverSocketId).emit("newMessage", newMessage);
      
      // Also emit to sender for real-time update
      const senderSocketId = global.userSocketMap[senderId];
      if (senderSocketId && senderSocketId !== receiverSocketId) {
        global.io.to(senderSocketId).emit("newMessage", newMessage);
      }
    }
    
    res.json({ 
      success: true, 
      message: "Message sent successfully", 
      newMessage 
    });

  } catch (error: unknown) {
    console.error(error);
    res.json({
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send message'
    });
  }
}
