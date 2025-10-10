import Message from "@/models/message.js";
import User from "@/models/user.js";
import cloudinary from "@/config/cloudinary.js";

// Get all users except the logged-in user
export const getUsersForSidebar = async (clerkId: string) => {
  // Fetch all users except the current one
  const filteredUsers = await User.find({ clerkId: { $ne: clerkId } })
    .select("-password")
    .lean();

  // Number of unseen messages
  const unseenMessages: { [key: string]: number } = {};

  const promises = filteredUsers.map(async (user) => {
    const messages = await Message.find({
      senderId: user.clerkId,
      receiverId: clerkId,
      seen: false,
    });

    if (messages.length > 0) {
      unseenMessages[user.clerkId] = messages.length;
    }
  });

  await Promise.all(promises);

  return { users: filteredUsers, unseenMessages };
};

// Get all messages between current user and selected user
export const getMessages = async (myClerkId: string, selectedClerkId: string) => {
  const messages = await Message.find({
    $or: [
      { senderId: myClerkId, receiverId: selectedClerkId },
      { senderId: selectedClerkId, receiverId: myClerkId },
    ],
  });

  // Mark messages from selected user as seen
  await Message.updateMany(
    { senderId: selectedClerkId, receiverId: myClerkId },
    { seen: true }
  );

  return messages;
};

// Mark a message as seen by ID
export const markMessageAsSeen = async (messageId: string) => {
  await Message.findByIdAndUpdate(messageId, { seen: true });
  return { message: "Message marked as seen" };
};

// Send a message or image
export const sendMessage = async (
  senderClerkId: string,
  receiverClerkId: string,
  text: string,
  image?: string
) => {
  let imageUrl;

  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }

  const newMessage = await Message.create({
    senderId: senderClerkId,
    receiverId: receiverClerkId,
    text,
    image: imageUrl,
  });

  return newMessage;
};
