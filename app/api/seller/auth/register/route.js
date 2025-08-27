import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/dbConnect.js";
import User from "@/model/User";

export async function POST(request) {
	try {
		await dbConnect();

		const { firstName, lastName, email, mobile, password } =
			await request.json();

		if (!firstName || !lastName || !email || !mobile || !password) {
			return NextResponse.json(
				{ success: false, message: "All fields are required" },
				{ status: 400 }
			);
		}

		// Check if seller already exists
		const existingUser = await User.findOne({
			email: email.toLowerCase(),
		});

		if (existingUser) {
			return NextResponse.json(
				{ success: false, message: "User with this email already exists" },
				{ status: 409 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create new seller
		const newSeller = new User({
			firstName,
			lastName,
			email: email.toLowerCase(),
			mobile,
			password: hashedPassword,
			userType: "seller",
			isActive: true,
			lastLogin: new Date(),
		});

		await newSeller.save();

		return NextResponse.json({
			success: true,
			message: "Seller registered successfully",
		});
	} catch (error) {
		console.error("Seller registration error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
