import { Request, Response } from "express";
import User, { IUser } from "@/models/user";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/utils";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary"

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


// controller to signup new user
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


// controller to login user
export const login = async (req: Request<{}, {}, SignupBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({email})
    
    const isPasswordCorrect = await bcrypt.compare(password, userData?.password);

    if (!isPasswordCorrect) {
      return res.json({ success: false, message: "Invalid credentials" })
    }

    const token = generateToken(userData?._id.toString());

    res.json({success: true, userData, token, message: "Login successful"})

  } catch (error: unknown) {
    console.error(error);
    res.json({success: false, message: error instanceof Error ? error.message : 'Failed to login'})
  }

}


// controller to check if user is authenticated
export const checkAuth = async (req: Request, res: Response) => {
  res.json({ success: true, user: req.user });
}


// controller to update user profile 
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { fullName, bio, profilePic } = req.body;

    const userId = req.user._id;
    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(userId, {
        fullName,
        bio
      }, {new: true});
    } else {
      const upload = await cloudinary.uploader.upload(profilePic);

      updatedUser = await User.findByIdAndUpdate(userId, {
        profilePic: upload.secure_url, 
        fullName,
        bio
      }, {new: true});
    }
    res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully"
    })

  } catch (error: unknown) {
    console.error(error);
    res.json({
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update profile'
    })
  }
}