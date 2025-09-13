import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  fullName: string;
  password: string;
  profilePic: string;
  bio: string;
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  profilePic: { type: String, default: "" },
  bio: { type: String, default: "" },
}, { timestamps: true });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
