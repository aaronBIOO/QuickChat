import jwt from "jsonwebtoken";

export const generateAccessToken = (userId: string) => {
  const accessToken = jwt.sign(
    { userId }, 
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  
  return accessToken;
}

export const generateRefreshToken = (userId: string) => {
  const refreshToken = jwt.sign(
    { userId }, 
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: "7d" }
  );
  
  return refreshToken;
}

export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
};


// data sanitization
export const sanitizeUser = (user: any) => ({
  _id: user._id?.toString(),
  email: user.email,
  fullName: user.fullName,
  bio: user.bio,
  profilePic: user.profilePic
});