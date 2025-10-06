import { Response, NextFunction } from "express";
import { AuthRequest } from "@/types/auth.js";
import {
  signupUser,
  loginUser,
  updateUserProfile,
  logoutUser,
} from "@/services/userServices.js";
import { sanitizeUser } from "@/utils/utils.js";


// signup new user
export const signup = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await signupUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      user,
      message: "Account created successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


// login user
export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await loginUser(req.body.email, req.body.password);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, user, message: "Login successful" });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


// check if user is authenticated
export const checkAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
  res.json({ success: true, user: sanitizeUser(req.user) });
};


// update user profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) {
      throw new Error('User not authenticated');
    }
    
    const userId = req.user._id.toString();
    const updatedUser = await updateUserProfile(userId, req.body);

    res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};


// logout user
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user?._id) {
      await logoutUser();
    }
    res.cookie("token", "", { maxAge: 0, httpOnly: true });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error during logout",
    });
  }
};
