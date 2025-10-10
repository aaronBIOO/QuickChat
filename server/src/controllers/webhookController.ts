import { Request, Response } from "express";
import { Webhook } from "svix";
import User from "@/models/user.js";
import { IncomingHttpHeaders } from "http";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export const handleClerkWebhook = async (req: Request, res: Response) => {
  if (!webhookSecret) {
    console.error("Missing Clerk webhook secret");
    return res.status(400).json({ success: false, message: "Missing webhook secret" });
  }

  const headers = req.headers as IncomingHttpHeaders;
  const svix_id = headers["svix-id"] as string;
  const svix_timestamp = headers["svix-timestamp"] as string;
  const svix_signature = headers["svix-signature"] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ success: false, message: "Missing required Clerk webhook headers" });
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(JSON.stringify(req.body), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  const { type: eventType, data } = event;

  try {
    switch (eventType) {
      // When a new Clerk user is created or updated
      case "user.created":
      case "user.updated": {
        const email = data.email_addresses?.[0]?.email_address ?? `no-email-${data.id}@temp.com`;
        const fullName = `${data.first_name || ""} ${data.last_name || "User"}`.trim();
        const profilePic = data.image_url ?? "";

        await User.findOneAndUpdate(
          { clerkId: data.id },
          {
            $set: {
              clerkId: data.id,
              email,
              fullName,
              profilePic,
              bio: "Please update your profile.",
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(` Clerk user ${data.id} synced successfully.`);
        break;
      }

      // When a Clerk user is deleted
      case "user.deleted": {
        await User.findOneAndDelete({ clerkId: data.id });
        console.log(` Clerk user ${data.id} deleted from MongoDB.`);
        break;
      }

      // Ignore unhandled event types
      default:
        console.log(`Unhandled Clerk webhook event type: ${eventType}`);
        break;
    }

    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (err) {
    console.error("Error handling Clerk webhook:", err);
    return res.status(500).json({ success: false, message: "Server error processing webhook" });
  }
}
