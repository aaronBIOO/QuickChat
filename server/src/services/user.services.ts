import User from "@/models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "@/config/cloudinary.js";
import { sanitizeUser } from "@/lib/utils.js";

interface UserInput {
  email: string;
  fullName: string;
  password: string;
  bio: string;
  profilePic?: string;  
}



// update user profile
export const updateUserProfile = async (
  userId: string,
  updates: { fullName: string; bio: string; profilePic?: string }
  ) => {
  const { fullName, bio, profilePic } = updates;

  if (!userId) throw new Error("User not authenticated");

  let uploadUrl;

  if (profilePic) {
    const upload = await cloudinary.uploader.upload(profilePic);
    uploadUrl = upload.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { 
      fullName,
      bio,
      ...(uploadUrl && { profilePic: uploadUrl }),
    }, { new: true }
  );

  return updatedUser;
};


// logout user
export const logoutUser = () => {
  return { message: "Logged out successfully" };
};
