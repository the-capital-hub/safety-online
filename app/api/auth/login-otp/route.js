import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import { createToken } from "@/lib/auth";
import { serialize } from "cookie";
import { verifyOTP, clearOTP } from "@/lib/otpStore";

export async function POST(req) {
	await dbConnect();
	const { mobile, code } = await req.json();

	if (!mobile || !code) {
		return Response.json(
			{ message: "Mobile and verification code are required" },
			{ status: 400 }
		);
	}

	// Verify OTP
	const isValidOTP = verifyOTP(mobile, code);
	if (!isValidOTP) {
		return Response.json(
			{ message: "Invalid or expired verification code" },
			{ status: 400 }
		);
	}

	// Find user by mobile
	const user = await User.findOne({ mobile });
	if (!user) {
		return Response.json(
			{ message: "No account found with this mobile number" },
			{ status: 404 }
		);
	}

	// Clear OTP after successful verification
	clearOTP(mobile);

	// Create token and set cookie
	const token = createToken(user);
	const cookie = serialize("auth_token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});

	return new Response(
		JSON.stringify({
			message: "Login successful",
			user: {
				id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				mobile: user.mobile,
			},
		}),
		{
			status: 200,
			headers: { "Set-Cookie": cookie },
		}
	);
}
