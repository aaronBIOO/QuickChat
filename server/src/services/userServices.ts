import User from "@/models/user";
import bcrypt from "bcryptjs";
import cloudinary from "@/config/cloudinary";
import { generateToken, sanitizeUser } from "@/utils/utils";

interface UserInput {
  email: string;
  fullName: string;
  password: string;
  bio: string;
  profilePic?: string;
}

// signup new user
export const signupUser = async (data: UserInput) => {
  const { email, fullName, password, bio } = data;

  if (!email || !fullName || !password || !bio) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("Account already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    email,
    fullName,
    password: hashedPassword,
    bio,
    profilePic: "",
  });

  const token = generateToken(newUser._id.toString());
  const safeUser = sanitizeUser(newUser);

  return { token, user: safeUser };
};


// login user
export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) throw new Error("Invalid credentials");

  const token = generateToken(user._id.toString());
  const safeUser = sanitizeUser(user);

  return { token, user: safeUser };
};


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
