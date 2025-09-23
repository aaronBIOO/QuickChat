import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectToDB } from "@/lib/db";
import userRouter from "@/routes/userRoutes";
import messageRouter from "@/routes/messageRoute";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";


dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});


export const userSocketMap: { [userId: string]: string } = {};

declare global {
  var io: Server;
  var userSocketMap: { [userId: string]: string };
}


export { io };


global.io = io;
global.userSocketMap = userSocketMap;


// socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string | undefined;
  console.log("User Connected", userId);

  if (userId && typeof userId === 'string') {
    userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      console.log("user disconnected", userId);
      if (userId && typeof userId === 'string') {
        delete userSocketMap[userId];
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap))
    });
  }
});


// middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());


// routes
app.use("/api/status", (req: Request, res: Response): void => {
  res.send("Server is live");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
app.get("/", (req: Request, res: Response): void => {
  res.send("This is a simple response from our server!");
});



// database connection
const startServer = async (): Promise<void> => {
  try {
    await connectToDB();
    const PORT: number = Number(process.env.PORT) || 5000;
    server.listen(PORT, (): void => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
