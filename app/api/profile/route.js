import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";

export async function GET(req) {
	try {
		await dbConnect();
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

		const user = await User.findById(id).select("-password").lean();
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		return NextResponse.json({ user });
	} catch (e) {
		console.error("[profile GET]", e);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PUT(req) {
	try {
		await dbConnect();
		const body = await req.json();
		const { id, firstName, lastName, email, mobile, profilePic } = body || {};

		if (!id)
			return NextResponse.json({ error: "Missing user ID" }, { status: 400 });

		// Build update object with only provided fields
		const update = {};
		if (firstName !== undefined) update.firstName = firstName;
		if (lastName !== undefined) update.lastName = lastName;
		if (email !== undefined) update.email = email;
		if (mobile !== undefined) update.mobile = mobile;
		if (profilePic !== undefined) update.profilePic = profilePic;

		// Check if user exists
		const user = await User.findById(id);
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		// Check for email/mobile uniqueness if they're being updated
		if (email && email !== user.email) {
			const existingEmail = await User.findOne({ email, _id: { $ne: id } });
			if (existingEmail) {
				return NextResponse.json(
					{ error: "Email already in use" },
					{ status: 400 }
				);
			}
		}

		if (mobile && mobile !== user.mobile) {
			const existingMobile = await User.findOne({ mobile, _id: { $ne: id } });
			if (existingMobile) {
				return NextResponse.json(
					{ error: "Mobile number already in use" },
					{ status: 400 }
				);
			}
		}

		// Update user
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ $set: update },
			{ new: true, runValidators: true }
		).select("-password");

		return NextResponse.json(
			{
				success: true,
				message: "Profile updated successfully",
				user: updatedUser,
			},
			{ status: 200 }
		);
	} catch (e) {
		console.error("Failed to update profile", e);

		// Handle validation errors
		if (e.name === "ValidationError") {
			const errors = Object.values(e.errors).map((err) => err.message);
			return NextResponse.json(
				{ message: "Validation error", errors },
				{ status: 400 }
			);
		}

		// Handle duplicate key errors
		if (e.code === 11000) {
			const field = Object.keys(e.keyValue)[0];
			return NextResponse.json(
				{
					message: `${
						field.charAt(0).toUpperCase() + field.slice(1)
					} already exists`,
				},
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ message: "Failed to update profile" },
			{ status: 500 }
		);
	}
}
