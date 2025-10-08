import { Response, NextFunction } from "express";
import { AuthRequest } from "@/types/auth.js";
import User from "@/models/user.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "@/utils/utils.js";


export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {

    if (!process.env.REFRESH_TOKEN_SECRET) {
      console.error("FATAL ERROR: REFRESH_TOKEN_SECRET is not set in .env!");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }

    const refreshToken = req.cookies.refreshToken as string;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    let payload: any;
    try {
      payload = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(payload.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.json({ success: true, accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
