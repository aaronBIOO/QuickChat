import { Request, Response } from "express";
import User, { IUser } from "@/models/user";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/utils";
import mongoose from "mongoose";

interface IUserInput {
  email: string;
  fullName: string;
  password: string;
  bio: string;
  profilePic: string;
}

interface SignupBody {
  email: string;
  fullName: string;
  password: string;
  bio: string;
}

// Signup new user
export const signup = async (req: Request<{}, {}, SignupBody>, res: Response) => {
  
  const { email, fullName, password, bio } = req.body;

  try {
    if (!email || !fullName || !password || !bio) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({email})
    if (user) {
return res.status(400).json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const userInput: IUserInput = {
      email,
      fullName,
      password: hashedPassword,
      bio,
      profilePic: ""
    };
    
    const newUser = await User.create(userInput);

    const token = generateToken(newUser._id.toString());

    const userResponse = {
      _id: newUser._id.toString(),
      email: newUser.email,
      fullName: newUser.fullName,
      bio: newUser.bio,
      profilePic: newUser.profilePic
    };

    return res.status(201).json({ 
      success: true, 
      user: userResponse,
      token, 
      message: "Account created successfully" 
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
    return res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
}
