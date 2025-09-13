import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Status endpoint
app.use("/api/status", (req: Request, res: Response): void => {
  res.send("Server is live");
});

// Start server
const PORT: number = Number(process.env.PORT) || 5000;
server.listen(PORT, (): void => {
  console.log(`Server running on port ${PORT}`);
});