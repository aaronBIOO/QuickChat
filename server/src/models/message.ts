import mongoose, { Document, Schema } from "mongoose";

interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  text?: string;
  image?: string;
  seen: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  image: { type: String },
  seen: { type: Boolean, default: false }
}, { 
  timestamps: true 
});

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message;
