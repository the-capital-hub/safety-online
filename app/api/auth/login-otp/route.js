import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import { verifyOTP, clearOTP } from "@/lib/otpStore";
import { createToken } from "@/lib/auth";
import { serialize } from "cookie";

const LoginOTPSchema = z.object({
	emailOrMobile: z.string().trim().min(3, "Identifier is required"),
	code: z.string().trim().length(6, "Code must be 6 digits"),
});

export async function POST(req) {
	try {
		await dbConnect();
		const json = await req.json();
		const parsed = LoginOTPSchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: parsed.error.issues?.[0]?.message || "Invalid input" },
				{ status: 400 }
			);
		}

		const { emailOrMobile, code } = parsed.data;
		const user = await User.findOne({
			$or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
		});

		if (!user) {
			return NextResponse.json(
				{ message: "Account not found" },
				{ status: 404 }
			);
		}

		if (!user.mobile) {
			return NextResponse.json(
				{ message: "Please add mobile number first" },
				{ status: 400 }
			);
		}

		const isValid = verifyOTP(user.mobile, code);
		if (!isValid) {
			return NextResponse.json(
				{ message: "Invalid or expired code" },
				{ status: 400 }
			);
		}

		clearOTP(user.mobile);

		// Set lastLogin
		user.lastLogin = new Date();
		await user.save();

		const token = createToken(user);
		const cookie = serialize("auth_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 60 * 60 * 24 * 7,
		});

		return new Response(
			JSON.stringify({
				success: true,
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
				headers: { "Set-Cookie": cookie, "Content-Type": "application/json" },
			}
		);
	} catch (err) {
		console.error("Login OTP error:", err);
		return NextResponse.json({ message: "Failed to sign in" }, { status: 500 });
	}
}
