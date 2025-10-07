import { Server, Socket } from "socket.io";
import http from "http";


export const userSocketMap: Record<string, string> = {};
export let io: Server;

function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  const userId = socket.handshake.query.userId as string | undefined;

  if (!userId) {
    const err = new Error("Authentication required.");
    console.error("Socket Auth Failure: Missing User ID.");
    return next(err);
  }

  (socket as any).userId = userId;
  next();
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

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId}`);

    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${userId}. Reason: ${reason}`);
      
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      socket.on("error", (err) => {
        console.error(`Socket Error for User: ${userId}. Error: ${err.message}`);
      });
    });
  });

  io.on("error", (error) => {
    console.error("Global Socket.IO Server Error:", error);
  });
}