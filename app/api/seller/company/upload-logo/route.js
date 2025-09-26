import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
	try {
		const cookieStore = cookies();
		const token = cookieStore.get("seller-auth-token")?.value;
		if (!token) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		try {
			jwt.verify(token, process.env.JWT_SECRET);
		} catch (err) {
			return NextResponse.json({ error: "Invalid token" }, { status: 401 });
		}

		const formData = await req.formData();
		const file = formData.get("file");
		if (!file) {
			return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const uploaded = await new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(
				{
					folder: "company-logos",
					resource_type: "image",
					transformation: [{ quality: "auto", fetch_format: "auto" }],
				},
				(err, result) => {
					if (err) return reject(err);
					resolve(result);
				}
			);
			stream.end(buffer);
		});

		// uploaded may be undefined if Cloudinary returns nothing; guard it
		if (!uploaded || !uploaded.secure_url) {
			return NextResponse.json({ error: "Upload failed" }, { status: 500 });
		}

		return NextResponse.json({ url: uploaded.secure_url });
	} catch (err) {
		// log full error server-side for debugging
		console.error("Cloudinary upload error:", err);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
