import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary.js";
import { Readable } from "stream";

const ALLOWED_FOLDERS = {
	safety_user_pic: "safety_user_pic",
	default: "safety_product_reviews",
};

export async function POST(req) {
	try {
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

		const url = await new Promise((resolve, reject) => {
			const upload = cloudinary.uploader.upload_stream(
				{
					resource_type: "image",
					folder: folderName,
					transformation: [{ width: 1600, height: 1600, crop: "limit" }],
					quality: "auto",
					format: "webp",
					use_filename: true,
					unique_filename: true,
				},
				(error, result) => {
					if (error) return reject(error);
					resolve(result.secure_url);
				}
			);

			// Create readable stream from buffer
			const readable = new Readable();
			readable._read = () => {};
			readable.push(buffer);
			readable.push(null);
			readable.pipe(upload);
		});

		return NextResponse.json(
			{
				success: true,
				url,
				message: "Upload successful",
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("[upload] error:", error);

		// Return more specific error messages
		let errorMessage = "Upload failed";
		if (error.message?.includes("Invalid image file")) {
			errorMessage = "Invalid image file";
		} else if (error.message?.includes("File too large")) {
			errorMessage = "File too large";
		}

		return NextResponse.json(
			{ success: false, message: errorMessage },
			{ status: 500 }
		);
	}
}
