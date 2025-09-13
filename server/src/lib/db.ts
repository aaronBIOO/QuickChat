import mongoose from "mongoose";

export const connectToDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    })

    await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`);
  } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
  }
};

