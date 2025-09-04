import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User";

export async function PUT(req) {
	try {
		await dbConnect();
		const body = await req.json();
		const { userId, oldPassword, newPassword } = body || {};

		// Validate required fields
		if (!userId || !oldPassword || !newPassword) {
			return NextResponse.json(
				{ error: "User ID, old password, and new password are required" },
				{ status: 400 }
			);
		}

		// Validate new password length
		if (newPassword.length < 6) {
			return NextResponse.json(
				{ error: "New password must be at least 6 characters long" },
				{ status: 400 }
			);
		}

		// Find user with password field
		const user = await User.findById(userId);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Verify old password
		const isOldPasswordValid = await user.comparePassword(oldPassword);
		if (!isOldPasswordValid) {
			return NextResponse.json(
				{ error: "Current password is incorrect" },
				{ status: 400 }
			);
		}

		// Check if new password is different from old password
		const isSamePassword = await user.comparePassword(newPassword);
		if (isSamePassword) {
			return NextResponse.json(
				{ error: "New password must be different from current password" },
				{ status: 400 }
			);
		}

		// Update password (pre-save hook will hash it)
		user.password = newPassword;
		await user.save();

		return NextResponse.json(
			{
				success: true,
				message: "Password updated successfully",
			},
			{ status: 200 }
		);
	} catch (e) {
		console.error("Failed to update password", e);

		// Handle validation errors
		if (e.name === "ValidationError") {
			const errors = Object.values(e.errors).map((err) => err.message);
			return NextResponse.json(
				{ message: "Validation error", errors },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ message: "Failed to update password" },
			{ status: 500 }
		);
	}
}
