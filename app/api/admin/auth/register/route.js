import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import bcrypt from "bcryptjs";

export async function POST(req) {
	await dbConnect();

	try {
		const { email, password, firstName, lastName } = await req.json();

		// Validation
		if (!email || !password) {
			return Response.json(
				{ message: "Email and password are required" },
				{ status: 400 }
			);
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email });

		if (existingUser) {
			return Response.json({ message: "User already exists" }, { status: 409 });
		}

		const newUser = new User({
			email,
			password,
			firstName,
			lastName,
			isVerified: true,
			userType: "admin",
		});

		await newUser.save();

		return Response.json(
			{
				message: "Registration successful",
				userId: newUser._id,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Registration error:", error);
		return Response.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
