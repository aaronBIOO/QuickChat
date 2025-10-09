import { Response, NextFunction } from "express";
import { AuthRequest } from "@/types/auth.js";
import { updateUserProfile, logoutUser } from "@/services/userServices.js";
import { sanitizeUser } from "@/lib/utils.js";


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
      user: sanitizeUser(updatedUser),
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
     
    res.status(200).json({ success: true, message: "Logged out successfully (Clerk managed)" });
  } catch (error) {
    res.status(500).json({
    success: false,
    message: "Internal Server Error during logout",
    });
  } 
};
