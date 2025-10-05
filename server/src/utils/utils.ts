import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
  const token = jwt.sign(
    { userId }, 
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
}

// helper to remove sensitive data before sending a user object to the client
export const sanitizeUser = (user: any) => ({
  _id: user._id?.toString(),
  email: user.email,
  fullName: user.fullName,
  bio: user.bio,
  profilePic: user.profilePic
});