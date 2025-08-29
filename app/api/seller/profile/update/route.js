import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary.js";
import jwt from "jsonwebtoken";

export async function PUT(request) {
	try {
		await dbConnect();

		// Get token from cookies
		const token = request.cookies.get("auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const userId = decoded.userId;

		const formData = await request.formData();
		const firstName = formData.get("firstName");
		const lastName = formData.get("lastName");
		const email = formData.get("email");
		const mobile = formData.get("mobile");
		const addressesData = formData.get("addresses");
		const profilePicFile = formData.get("profilePic");

		// Find the seller
		const user = await User.findById(userId);
		if (!user || user.userType !== "seller") {
			return NextResponse.json(
				{ success: false, message: "Seller not found" },
				{ status: 404 }
			);
		}

		// Update basic fields
		if (firstName) user.firstName = firstName;
		if (lastName) user.lastName = lastName;
		if (email) user.email = email.toLowerCase();
		if (mobile) user.mobile = mobile;

		if (addressesData) {
			try {
				const addresses = JSON.parse(addressesData);
				user.addresses = addresses;
			} catch (error) {
				console.error("Error parsing addresses:", error);
			}
		}

		if (profilePicFile && profilePicFile instanceof File) {
			try {
				const buffer = Buffer.from(await profilePicFile.arrayBuffer());

				const uploadResult = await new Promise((resolve, reject) => {
					cloudinary.uploader
						.upload_stream(
							{
								resource_type: "image",
								folder: "seller_profile_pics",
								quality: "auto",
								format: "webp",
								transformation: [{ width: 400, height: 400, crop: "fill" }],
							},
							(error, result) => {
								if (error) {
									console.error("Cloudinary upload error:", error);
									reject(error);
								} else {
									resolve(result.secure_url);
								}
							}
						)
						.end(buffer);
				});

				user.profilePic = uploadResult;
				console.log("Profile picture uploaded successfully:", uploadResult);
			} catch (error) {
				console.error("Profile picture upload error:", error);
				return NextResponse.json(
					{
						success: false,
						message: "Failed to upload profile picture",
					},
					{ status: 500 }
				);
			}
		}

		await user.save();

		// Remove password from response
		const { password: _, ...userWithoutPassword } = user.toObject();

		return NextResponse.json({
			success: true,
			message: "Profile updated successfully",
			user: userWithoutPassword,
		});
	} catch (error) {
		console.error("Profile update error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
