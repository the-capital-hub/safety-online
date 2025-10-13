import { NextResponse } from "next/server";
import cloudinary, {
        isCloudinaryConfigured,
        missingCloudinaryConfig,
} from "@/lib/cloudinary.js";

const ALLOWED_FOLDERS = {
        safety_user_pic: "safety_user_pic",
        default: "safety_product_reviews",
        brand_promotions: "safety_brand_promotions",
        blog_covers: "safety_blog_covers",
};

export async function POST(req) {
        try {
                if (!isCloudinaryConfigured) {
                        const missingMessage = missingCloudinaryConfig.length
                                ? `Missing environment variables: ${missingCloudinaryConfig.join(", ")}`
                                : "Missing Cloudinary environment variables.";

                        return NextResponse.json(
                                {
                                        success: false,
                                        message: `Cloudinary configuration is incomplete. ${missingMessage}`,
                                },
                                { status: 500 }
                        );
                }

                const formData = await req.formData();
		const file = formData.get("file");
		const folder = formData.get("folder") || "default";

		if (!file) {
			return NextResponse.json(
				{ success: false, message: "No file uploaded" },
				{ status: 400 }
			);
		}

		// Validate folder name
		const folderName = ALLOWED_FOLDERS[folder];
		if (!folderName) {
			return NextResponse.json(
				{ success: false, message: "Invalid folder specified" },
				{ status: 400 }
			);
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			return NextResponse.json(
				{ success: false, message: "Only image files are allowed" },
				{ status: 400 }
			);
		}

		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{ success: false, message: "File size must be less than 5MB" },
				{ status: 400 }
			);
		}

                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString("base64");
                const dataUri = `data:${file.type};base64,${base64}`;

                const result = await cloudinary.uploader.upload(dataUri, {
                        resource_type: "image",
                        folder: folderName,
                        transformation: [{ width: 1600, height: 1600, crop: "limit" }],
                        quality: "auto",
                        format: "webp",
                        use_filename: true,
                        unique_filename: true,
                });

                return NextResponse.json(
                        {
                                success: true,
                                url: result.secure_url,
                                publicId: result.public_id,
                                assetId: result.asset_id,
                                message: "Upload successful",
                        },
                        { status: 200 }
                );
	} catch (error) {
		console.error("[upload] error:", error);

		// Return more specific error messages
                let errorMessage = "Upload failed";
                const cloudinaryMessage = error?.response?.body?.error?.message;
                if (cloudinaryMessage) {
                        errorMessage = cloudinaryMessage;
                } else if (error.message?.includes("Invalid image file")) {
                        errorMessage = "Invalid image file";
                } else if (error.message?.includes("File too large")) {
                        errorMessage = "File too large";
                } else if (error.message) {
                        errorMessage = error.message;
                }

                return NextResponse.json(
                        { success: false, message: errorMessage },
                        { status: 500 }
		);
	}
}
