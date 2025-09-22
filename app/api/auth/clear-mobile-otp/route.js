import { NextResponse } from "next/server";
import { clearOTP } from "@/lib/otpStore";

export async function POST(req) {
	try {
		const { mobile } = await req.json();
		if (!mobile) {
			return NextResponse.json(
				{ message: "Mobile is required" },
				{ status: 400 }
			);
		}
		clearOTP(mobile);
		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Clear OTP error:", err);
		return NextResponse.json(
			{ message: "Failed to clear code" },
			{ status: 500 }
		);
	}
}
