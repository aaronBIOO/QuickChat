import { Request, Response } from 'express';
import { Webhook } from "svix";
import User from "@/models/user.js";
import { IncomingHttpHeaders } from 'http';
import { getClerkPasswordHash } from '@/lib/auth.js';


interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
    }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const payload = req.body;
  const headers = req.headers as IncomingHttpHeaders;
  
  const svix_id = headers["svix-id"] as string;
  const svix_timestamp = headers["svix-timestamp"] as string;
  const svix_signature = headers["svix-signature"] as string;

  if (!svix_id || !svix_timestamp || !svix_signature || !webhookSecret) {
      console.error("Missing required webhook headers or secret.");
      return res.status(400).json({ success: false, message: "Webhook Error: Missing headers or secret" });
  }
    
  let evt: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Clerk Webhook verification failed:", err);
    return res.status(400).json({ success: false, message: "Webhook Error: Verification Failed" });
  }

  const evtType = evt.type;
  const data = evt.data;
  
  try {
    switch (evtType) {
      case "user.created":
      case "user.updated":
        const CLERK_PASSWORD_HASH = await getClerkPasswordHash(); 

        await User.findOneAndUpdate(
          { clerkId: data.id }, 
          {
            $set: {
              clerkId: data.id,
              email: data.email_addresses[0]?.email_address || `no-email-${data.id}@temp.com`,
              fullName: `${data.first_name || ''} ${data.last_name || 'User'}`.trim(),
              profilePic: data.image_url,
              password: CLERK_PASSWORD_HASH, 
              bio: "Please update your profile.",
            },
          },
          { 
            upsert: true, 
            new: true, 
            setDefaultsOnInsert: true 
          }
        );
        
        console.log(`User ${data.id} synchronized/upserted.`);
        break;
      
      case "user.deleted":
        await User.findOneAndDelete({ clerkId: data.id });
        console.log(`User ${data.id} deleted from database.`);
        break;
          
      default:
        console.log(`Unhandled Clerk event type: ${evtType}`);
    }
  } catch (dbError) {
      console.error("Database error processing Clerk webhook:", dbError);
    return res.status(500).json({ success: false, message: "Database Error" });
  }

  res.status(200).json({ success: true, message: "Webhook received and processed" });
};