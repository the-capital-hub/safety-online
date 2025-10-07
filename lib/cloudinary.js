import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_CLOUD_NAME =
        process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";

export const missingCloudinaryConfig = [];

if (!CLOUDINARY_CLOUD_NAME) {
        missingCloudinaryConfig.push("CLOUDINARY_CLOUD_NAME");
}

if (!CLOUDINARY_API_KEY) {
        missingCloudinaryConfig.push("CLOUDINARY_API_KEY");
}

if (!CLOUDINARY_API_SECRET) {
        missingCloudinaryConfig.push("CLOUDINARY_API_SECRET");
}

export const isCloudinaryConfigured = missingCloudinaryConfig.length === 0;

if (isCloudinaryConfigured) {
        cloudinary.config({
                cloud_name: CLOUDINARY_CLOUD_NAME,
                api_key: CLOUDINARY_API_KEY,
                api_secret: CLOUDINARY_API_SECRET,
        });
} else {
        console.warn(
                `Cloudinary configuration is incomplete. Missing environment variables: ${missingCloudinaryConfig.join(
                        ", "
                )}`
        );
}

export default cloudinary;
