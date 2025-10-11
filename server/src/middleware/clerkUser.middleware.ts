import { NextFunction, Response } from "express";
import { getAuth } from "@clerk/express";
import { clerkClient } from "@/config/clerk.js";
import User from "@/models/user.model.js";
import { AuthRequest } from "@/types/auth.js";

export const attachClerkUser = async ( req: AuthRequest, res: Response, next: NextFunction ) => {
  try {

    console.log("==== Incoming Request ====");
    console.log("Authorization Header:", req.headers.authorization);
    console.log("Cookies:", req.headers.cookie);
    
    const { userId, isAuthenticated } = getAuth(req);
    console.log("getAuth() result:", { userId, isAuthenticated });


    // Explicitly check both flags
    if (!isAuthenticated || !userId) {
      console.log("User is not authenticated or no userId found.");
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    // find the user in MongoDB
    let mongoUser = await User.findOne({ clerkId: userId }).select("-password");
    console.log("Found user in DB:", mongoUser ? mongoUser._id : "No user found");

    // If user not in DB, fetch from Clerk and create
    if (!mongoUser) {
      console.log("User not found in DB, creating new user...");
      const clerkUser = await clerkClient.users.getUser(userId); 
      console.log("Fetched Clerk user:", clerkUser.id);

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const fullName = `${clerkUser.firstName || ""} ${
        clerkUser.lastName || ""
      }`.trim();

      if (!email) {
        console.error("Clerk user has no email address. Cannot sync.");
        return res
          .status(500)
          .json({ success: false, message: "Missing primary email address." });
      }

      mongoUser = await User.create({
        clerkId: userId,
        email,
        fullName,
      });
      console.log(`New user created in MongoDB: ${fullName}`);
    }

    // Attach the user to req.user for controllers
    const user = mongoUser.toObject();
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      bio: user.bio || "",
      profilePic: user.profilePic || "",
    };

    console.log("Attached user to request:", req.user);

    next();
  } catch (error) {
    console.error("MongoDB Sync/Attach Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during user lookup",
    });
  }
};
