import { User } from "@/models/user";

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        email?: string;
        fullName?: string;
        bio?: string;
        profilePic?: string;
      };
    }
  }
}

/// <reference types="@clerk/express/env" />

export {};
