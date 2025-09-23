// import { NextResponse } from "next/server";
// import { clearOTP } from "@/lib/otpStore";

// export async function POST(req) {
// 	try {
// 		const { mobile } = await req.json();
// 		if (!mobile) {
// 			return NextResponse.json(
// 				{ message: "Mobile is required" },
// 				{ status: 400 }
// 			);
// 		}
// 		clearOTP(mobile);
// 		return NextResponse.json({ success: true });
// 	} catch (err) {
// 		console.error("Clear OTP error:", err);
// 		return NextResponse.json(
// 			{ message: "Failed to clear code" },
// 			{ status: 500 }
// 		);
// 	}
// }

import { NextResponse } from "next/server";
import { z } from "zod";
import { clearOTP } from "@/lib/otpStore";

const ClearSchema = z.object({
	mobile: z
		.string()
		.trim()
		.regex(/^\d{10}$/, "Mobile must be a 10-digit number"),
});

export async function POST(req) {
	try {
		const json = await req.json();
		const parsed = ClearSchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json(
				{ message: parsed.error.issues?.[0]?.message || "Invalid input" },
				{ status: 400 }
			);
		}

		const { mobile } = parsed.data;
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
