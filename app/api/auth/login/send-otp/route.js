import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/model/User.js";
import { sendOtpMobile } from "@/lib/sendMobileOtp";
import { saveOTP } from "@/lib/otpStore";

const LoginSendOTPSchema = z.object({
	emailOrMobile: z.string().trim().min(3, "Identifier is required"),
});

function generateCode() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
	try {
		await dbConnect();
		const json = await req.json();
		const parsed = LoginSendOTPSchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: parsed.error.issues?.[0]?.message || "Invalid input" },
				{ status: 400 }
			);
		}

		const { emailOrMobile } = parsed.data;
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
			// Requirement: do not send OTP if user has no mobile saved
			return NextResponse.json(
				{ message: "Please add mobile number first" },
				{ status: 400 }
			);
		}

		const code = generateCode();
		saveOTP(user.mobile, code);
		await sendOtpMobile(user.mobile, code);

		return NextResponse.json({
			success: true,
			message: "Verification code sent to your mobile",
		});
	} catch (err) {
		console.error("Login send-otp error:", err);
		return NextResponse.json(
			{ message: "Failed to send verification code" },
			{ status: 500 }
		);
	}
}
