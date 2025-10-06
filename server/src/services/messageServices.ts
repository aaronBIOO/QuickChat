import Message from "@/models/message";
import User from "@/models/user";
import cloudinary from "@/config/cloudinary";


// get all users except the logged-in user
export const getUsersForSidebar = async (userId: string) => {
  const filteredUsers = await User.find({ _id: { $ne: userId } })
    .select("-password")
    .lean();

  // number of messages not seen
  const unseenMessages: { [key: string]: number } = {};
  const promises = filteredUsers.map(async (user) => {
    const messages = await Message.find({
      senderId: userId,
      receiverId: user._id.toString(),
      seen: false,
    });
    if (messages.length > 0) {
      unseenMessages[user._id.toString()] = messages.length;
    }
  });

  await Promise.all(promises);

  return { users: filteredUsers, unseenMessages };
};


// get all messages between current user and selected user
export const getMessages = async (myId: string, selectedUserId: string) => {
  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: selectedUserId },
      { senderId: selectedUserId, receiverId: myId },
    ],
  });

  // mark messages from selected user as seen
  await Message.updateMany(
    { senderId: selectedUserId, receiverId: myId },
    { seen: true }
  );

  return messages;
};


// mark a message as seen by ID
export const markMessageAsSeen = async (messageId: string) => {
  await Message.findByIdAndUpdate(messageId, { seen: true });
  return { message: "Message marked as seen" };
};


// send a message or image
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  text: string,
  image?: string
) => {
  let imageUrl;

  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });

  return newMessage;
};
