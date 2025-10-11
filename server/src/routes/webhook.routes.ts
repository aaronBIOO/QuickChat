import express from "express";
import { handleClerkWebhook } from "@/controllers/webhook.controller.js";

const router = express.Router();

router.post("/webhooks/clerk", express.raw({ type: "application/json" }), handleClerkWebhook);

export default router;
