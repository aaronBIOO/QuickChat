import { Server, Socket } from "socket.io";
import jwt, { Secret, JwtHeader } from "jsonwebtoken";
import jwksClient from "jwks-rsa"
import http from "http";
import { corsConfig } from "@/config/cors.js";

interface AuthSocket extends Socket {
  userId?: string;
}

const CLERK_JWKS_URL = process.env.CLERK_JWKS_URL;

const client = jwksClient({
  jwksUri: CLERK_JWKS_URL!,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
})

const getKey = (header: JwtHeader, callback: (err: Error | null, key?: Secret) => void) => {
  if (!header.kid) {
    return callback(new Error("Token header is missing 'kid' (Key ID)."));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    
    const signingKey = key?.getPublicKey() as Secret; 
    callback(null, signingKey);
  });
}

export const userSocketMap: Record<string, Set<string>> = {};
export let io: Server;

const socketAuthMiddleware = async (socket: AuthSocket, next: (err?: Error) => void) => {
  try {
    const { token } = socket.handshake.auth;
    const issuer = process.env.CLERK_JWT_ISSUER;
    const audience = process.env.CLERK_JWT_AUDIENCE;

    if (!token || !issuer || !audience) {
      return next(new Error("Authentication required — missing token"));
    }

    const payload = await new Promise((resolve, reject) => {
      jwt.verify( token, getKey, 
        {
          issuer: issuer, 
          audience: audience,
        }, 
        (err, decoded) => {
          if (err) {
            return reject(err);
          }
          resolve(decoded as { sub: string } & jwt.JwtPayload);
        }
      );
    }) as { sub: string };

    socket.userId = payload.sub;

    next();
  } catch (error) {
    console.error("Socket Auth Error:", (error as Error).message);
    next(new Error("Invalid or expired token"));
  }
}

export function setupSocket(server: http.Server) {
  io = new Server(server, {
    cors: corsConfig,
    pingInterval: 10000,
    pingTimeout: 5000,
    allowRequest: (req, callback) => {
      const isReady = !!process.env.CLERK_JWKS_URL && !!process.env.CLERK_JWT_ISSUER;
      callback(null, isReady);
    },
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