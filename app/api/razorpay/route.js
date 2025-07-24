import { razorpay } from "@/lib/razorpay.js";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const body = await req.json();
		const { amount, currency = "INR", receipt } = body;

		if (!amount || amount <= 0) {
			return NextResponse.json(
				{ success: false, error: "Invalid amount" },
				{ status: 400 }
			);
		}

		const options = {
			amount: Math.round(amount * 100), // Razorpay uses paise
			currency,
			receipt: receipt || `order_rcptid_${Date.now()}`,
			payment_capture: 1,
		};

		const order = await razorpay.orders.create(options);

		return NextResponse.json({
			success: true,
			order: {
				id: order.id,
				amount: order.amount,
				currency: order.currency,
				receipt: order.receipt,
			},
		});
	} catch (error) {
		console.error("Razorpay order creation error:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
