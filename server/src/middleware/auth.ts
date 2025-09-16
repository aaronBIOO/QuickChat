
import jwt from "jsonwebtoken";
import User from "@/models/user";
import { NextFunction } from "express";
import { Request, Response } from "express";

// Middleware to protect routes
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

// 