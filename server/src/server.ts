import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectToDB } from "@/lib/db";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: "4mb" }));
app.use(cors());


app.use("/api/status", (req: Request, res: Response): void => {
  res.send("Server is live");
});

// Start server with database connection
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
