import { NextResponse } from "next/server";
import { sendOtpMobile } from "@/lib/sendMobileOtp";
import { saveOTP } from "@/lib/otpStore";

function generateCode() {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req) {
	try {
		const { mobile } = await req.json();

		if (!mobile) {
			return NextResponse.json(
				{ message: "Phone number is required" },
				{ status: 400 }
			);
		}

		const code = generateCode();

		saveOTP(mobile, code);
		await sendOtpMobile(mobile, code);

		return NextResponse.json({
			message: "Verification code sent",
			success: true,
		});
	} catch (err) {
		console.error("OTP error:", err);
		const errorMessage =
			err instanceof Error && err.message
				? err.message
				: "Failed to send verification code";
		return NextResponse.json({ message: errorMessage }, { status: 500 });
	}
}
