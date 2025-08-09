import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Promocode from "@/model/Promocode";

export async function POST(req) {
	try {
		await dbConnect();

		const { code, orderAmount } = await req.json();

		if (!code) {
			return NextResponse.json(
				{ success: false, message: "Coupon code is required" },
				{ status: 400 }
			);
		}

		if (!orderAmount || orderAmount <= 0) {
			return NextResponse.json(
				{ success: false, message: "Valid order amount is required" },
				{ status: 400 }
			);
		}

		// Find the coupon
		const coupon = await Promocode.findOne({
			code: code.toUpperCase(),
			published: true,
			status: "Active",
		});

		if (!coupon) {
			return NextResponse.json(
				{ success: false, message: "Invalid coupon code" },
				{ status: 404 }
			);
		}

		// Check if coupon is still valid (date range)
		const now = new Date();
		if (now < coupon.startDate || now > coupon.endDate) {
			return NextResponse.json(
				{ success: false, message: "Coupon has expired" },
				{ status: 400 }
			);
		}

		// Calculate discount amount
		const discountAmount = Math.round((orderAmount * coupon.discount) / 100);

		return NextResponse.json({
			success: true,
			coupon: {
				id: coupon._id,
				code: coupon.code,
				name: coupon.name,
				discount: coupon.discount,
				discountAmount,
				discountType: "percentage",
			},
		});
	} catch (error) {
		console.error("Coupon validation error:", error);
		return NextResponse.json(
			{ success: false, message: "Internal server error" },
			{ status: 500 }
		);
	}
}
