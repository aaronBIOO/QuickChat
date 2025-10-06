
import jwt from "jsonwebtoken";
import User from "@/models/user.js";
import { NextFunction, Response } from "express";
import { AuthRequest } from "@/types/auth.js";


export const protectRoute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token as string;

    if (!token) {
      return res.status(401).json({
          success: false,
          message: "Unauthorized - No token provided"
      });
    }

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await User.findById(decoded.userId).select("-password").lean();

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      profilePic: user.profilePic
    };
    next();
    
  } catch (error) {
    console.error("Auth middleware error: ", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ 
        success: false, 
        message: "session expired. Please login again", 
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        message: "invalid token. Please login again",
      });
    }

    return res.status(401).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unauthorized' 
    });
  }
}

