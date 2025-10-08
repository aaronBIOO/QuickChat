import { Server, Socket } from "socket.io";
import jwt from 'jsonwebtoken';
import http from "http";
import cookie from "cookie";

interface AuthSocket extends Socket {
  userId?: string;
}


export const userSocketMap: Record<string, Set<string>> = {};
export let io: Server;

const socketAuthMiddleware = (socket: AuthSocket, next: (err?: Error) => void) => {
  try {
    const rawCookies = socket.handshake.headers?.cookie;
    const { token } = rawCookies ? cookie.parse(rawCookies) : {};

    
    if (!token) {
      return next(new Error("Authentication required — missing token"));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    socket.userId = payload.userId;

    next();
  } catch (error) {
    console.error("Socket Auth Error:", (error as Error).message);
    next(new Error("Invalid or expired token"));
  }
}

export function setupSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  io.use(socketAuthMiddleware);

  io.on("connection", (socket: AuthSocket) => {
    const userId = socket.userId || "";
    console.log(`User connected: ${userId}`);

    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("error", (err) => {
      console.error(`Socket Error for User: ${userId}. Error: ${err.message}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${userId}. Reason: ${reason}`);
      
      if (userSocketMap[userId]) {
        userSocketMap[userId].delete(socket.id);
        if (userSocketMap[userId].size === 0) {
          delete userSocketMap[userId];
        }
      }
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });

  io.on("error", (error) => {
    console.error("Global Socket.IO Server Error:", error);
  });
}