import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      _id: string;
      email?: string;
      fullName?: string;
      bio?: string;
      profilePic?: string;
    };
  }
}

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email?: string;
    fullName?: string;
    bio?: string;
    profilePic?: string;
  };
}
