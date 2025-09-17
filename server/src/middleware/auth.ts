
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { NextFunction } from "express";
import { Request as ExpressRequest, Response } from "express";
import { Document } from 'mongoose';

// Extend the Express Request type to include the user property
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
    const token = req.headers.token as string;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
    
  } catch (error) {
    console.error(error);
    return res.status(401).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unauthorized' 
    });
  }
}

