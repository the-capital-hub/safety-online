import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudnary.js";
import { Readable } from "stream";

// async function streamToBuffer(readable) {
// 	const chunks = [];
// 	for await (const chunk of readable) {
// 		chunks.push(Buffer.from(chunk));
// 	}
// 	return Buffer.concat(chunks);
// }

export async function POST(req) {
	try {
		const formData = await req.formData();
		const file = formData.get("file");
		if (!file) {
			return NextResponse.json(
				{ success: false, message: "No file uploaded" },
				{ status: 400 }
			);
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const url = await new Promise((resolve, reject) => {
			const upload = cloudinary.uploader.upload_stream(
				{
					resource_type: "image",
					folder: "safety_product-reviews",
					transformation: [{ width: 1600, height: 1600, crop: "limit" }],
					quality: "auto",
					format: "webp",
				},
				(error, result) => {
					if (error) return reject(error);
					resolve(result.secure_url);
				}
			);

			// pipe buffer to cloudinary stream
			const readable = new Readable();
			readable._read = () => {};
			readable.push(buffer);
			readable.push(null);
			readable.pipe(upload);
		});

		return NextResponse.json({ success: true, url }, { status: 200 });
	} catch (e) {
		console.error("[upload] error:", e);
		return NextResponse.json(
			{ success: false, message: "Upload failed" },
			{ status: 500 }
		);
	}
}
