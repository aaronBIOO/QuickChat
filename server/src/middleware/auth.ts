
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { NextFunction } from "express";
import type { Request as ExpressRequest, Response } from "express";

export { ExpressRequest };
import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: Document;
    }
  }
}

// Middleware to protect routes
export const protectRoute = async (req: ExpressRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token as string;

    if (!token) {
      return res.status(401).json({
          success: false,
          message: "Unauthorized - No token provided"
      });
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    req.user = user;
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

