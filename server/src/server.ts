import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectToDB } from "@/config/db.js";
import userRouter from "@/routes/userRoutes.js";
import messageRouter from "@/routes/messageRoutes.js";
import cookieParser from "cookie-parser";
import { setupSocket } from "@/config/socket.js";
import authRouter from "@/routes/authRoutes.js";
import { corsConfig } from "@/config/cors.js";
import webhookRoutes from "@/routes/webhookRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import { getAuth } from "@clerk/express";
import { NextFunction } from "express";

dotenv.config();

const app = express();

// Webhook routes
app.use("/api/webhooks", webhookRoutes);


// middleware
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));

app.use(clerkMiddleware({ 
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,
  apiUrl: process.env.CLERK_FRONTEND_API_URL!,
  debug: true 
}));

app.use((req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  console.log("==== Clerk Debug Middleware Log ====");
  console.log("Authorization Header:", req.headers.authorization);
  console.log("Cookies:", req.headers.cookie);
  console.log("getAuth(req) result:", auth);
  console.log("====================================");
  next();
});

// API routes
app.use("/api", authRouter);
app.use("/api/user", userRouter);
app.use("/api/messages", messageRouter);

app.get("/", (req: Request, res: Response): void => {
  res.send("server is live");
});


const server = http.createServer(app);
setupSocket(server);

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

