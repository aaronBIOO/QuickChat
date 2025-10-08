import express from "express";
import { userSocketMap } from "@/config/socket.js";

const healthChecksRouter = express.Router();

healthChecksRouter.get("/socket", (req, res) => {
  res.send({ status: "ok", sockets: Object.keys(userSocketMap).length });
});


export default healthChecksRouter;
