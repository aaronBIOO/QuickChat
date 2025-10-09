
import { NextFunction, Response, Request } from 'express';
import { getAuth } from '@clerk/express'; 
import User from '@/models/user.js';


export const attachClerkUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const mongoUser = await User.findOne({ clerkId: userId }).select("-password");

    if (!mongoUser) {
        return res.status(401).json({ success: false, message: 'User not synchronized with database. Please sync.' });
    }
    (req as any).user = mongoUser;
    
    next();

  } catch (error) {
      console.error("MongoDB Sync/Attach Error:", error);
      res.status(500).json({ success: false, message: 'Internal server error during user lookup' });
  }
};
