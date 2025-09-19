import { Response } from "express";
import { Request as ExpressRequest } from "express";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/utils";
import { sanitizeUser } from "@/lib/utils";
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

interface LoginBody {
  email: string;
  password: string;
}


// controller to signup new user
export const signup = async (req: ExpressRequest<{}, {}, SignupBody>, res: Response) => {
  
  const { email, fullName, password, bio } = req.body;

  try {
    if (!email || !fullName || !password || !bio) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // checking for existing email
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

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
export const login = async (req: ExpressRequest<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;
    const userData = await User.findOne({ email });
    
    if (!userData) {
      return res.status(400).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    if (!userData.password) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid password" 
      });
    }
    
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = generateToken(userData._id.toString());
    const safeUser = sanitizeUser(userData);

    // Set JWT in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,     
      secure: process.env.NODE_ENV === "production", 
      sameSite: "strict", 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    res.json({
      success: true, 
      user: safeUser, 
      message: "Login successful" 
    });

  } catch (error: unknown) {
    console.error(error);
    return res.status(500).json({
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to login'
    });
  }
}


// controller to check if user is authenticated
export const checkAuth = async (req: ExpressRequest, res: Response) => {
  res.json({
    success: true, 
    user: sanitizeUser(req.user) 
  });
}


// controller to update user profile 
export const updateProfile = async (req: ExpressRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: "User not authenticated" 
    });
  }

  try {
    const { fullName, bio, profilePic } = req.body;
    const userId = req.user._id as string;
    
    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(userId, {
        fullName,
        bio
      }, {new: true});
    } else {
      try {
        const upload = await cloudinary.uploader.upload(profilePic);

        updatedUser = await User.findByIdAndUpdate(userId, {
        profilePic: upload.secure_url, 
        fullName,
        bio
        }, {new: true});
      } catch (error) {
        console.error("Cloudinary upload failed:", error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to upload profile picture" 
        });
      }
    }

    res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully"
    });

  } catch (error: unknown) {
    console.error(error);
    res.json({
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to update profile'
    })
  }
}