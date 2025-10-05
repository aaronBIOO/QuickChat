import { v2 as cloudinary } from "cloudinary";

if (!process.env.CLOUDINARY_API_KEY) {
  console.error("CRITICAL ERROR: Cloudinary API Key is missing from process.env!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;