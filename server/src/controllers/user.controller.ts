import { Response, NextFunction } from "express";
import { AuthRequest } from "@/types/auth.js";
import { updateUserProfile, logoutUser } from "@/services/user.services.js";
import { sanitizeUser } from "@/lib/utils.js";
import { getAuth } from "@clerk/express";


// sync user
export const syncUser = async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No valid Clerk session found",
      });
    }

    // Just return the Clerk userId — no DB lookups
    return res.status(200).json({
      success: true,
      user: { clerkId: auth.userId },
      message: "User synced successfully",
    });
  } catch (error) {
    console.error("Error syncing Clerk user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during Clerk sync",
    });
  }
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
