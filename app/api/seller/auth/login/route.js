import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbConnect } from "@/lib/dbConnect.js";
import User from "@/model/User";

export async function POST(request) {
	try {
		await dbConnect();

		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ success: false, message: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Find seller user
		const user = await User.findOne({
			email: email.toLowerCase(),
			userType: "seller",
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, message: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Check password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return NextResponse.json(
				{ success: false, message: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Generate JWT token
		const token = jwt.sign(
			{ userId: user._id, email: user.email, role: user.role },
			process.env.JWT_SECRET,
			{
				expiresIn: "7d",
			}
		);

		// Remove password from user object
		const { password: _, ...userWithoutPassword } = user.toObject();

		const response = NextResponse.json({
			success: true,
			message: "Login successful",
			user: userWithoutPassword,
			token,
		});

		// Set HTTP-only cookie
		response.cookies.set("auth-token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60, // 7 days
		});

		return response;
	} catch (error) {
		console.error("Seller login error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
