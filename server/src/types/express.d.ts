import { User } from "@/models/user";

// Extend Express Request type with Clerk's auth and our custom properties
declare global {
  namespace Express {
    interface Request {
      // Clerk auth
      auth?: {
        userId?: string;
        sessionId?: string;
        orgId?: string;
        sessionClaims?: Record<string, unknown>;
      };
      
      // Our custom user properties
      user?: {
        _id: string;
        email?: string;
        fullName?: string;
        bio?: string;
        profilePic?: string;
      };
    }
  }
}

// Include Clerk's type definitions
/// <reference types="@clerk/express/env" />

export {};
