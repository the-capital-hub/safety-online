import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOTP, clearOTP } from "@/lib/otpStore";

const VerifySchema = z.object({
	mobile: z
		.string()
		.trim()
		.regex(/^\d{10}$/, "Mobile must be a 10-digit number"),
	code: z.string().trim().length(6, "Code must be 6 digits"),
});

export async function POST(req) {
	try {
		const json = await req.json();
		const parsed = VerifySchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: parsed.error.issues?.[0]?.message || "Invalid input" },
				{ status: 400 }
			);
		}

		const { mobile, code } = parsed.data;
		const isValid = verifyOTP(mobile, code);
		if (!isValid) {
			return NextResponse.json(
				{ message: "Invalid or expired code" },
				{ status: 400 }
			);
		}

		clearOTP(mobile);
		return NextResponse.json({
			success: true,
			message: "Mobile verified successfully",
		});
	} catch (err) {
		console.error("Verify OTP error:", err);
		return NextResponse.json(
			{ message: "Failed to verify code" },
			{ status: 500 }
		);
	}
}
