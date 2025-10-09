import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectToDB } from "@/config/db.js";
import userRouter from "@/routes/userRoutes.js";
import messageRouter from "@/routes/messageRoute.js";
import cookieParser from "cookie-parser";
import { setupSocket } from "@/config/socket.js";
import healthChecksRouter from "@/routes/healthChecks.js";
import authRouter from "@/routes/authRoute.js";
import { corsConfig } from "@/config/cors.js";


dotenv.config();

const app = express();
const server = http.createServer(app);

setupSocket(server);

// middleware
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json({ limit: "4mb" }));


// routes
app.use("/api/auth", authRouter);
app.use("/api/auth/user", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/health", healthChecksRouter);
app.get("/", (req: Request, res: Response): void => {
  res.send("server is live");
});


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

