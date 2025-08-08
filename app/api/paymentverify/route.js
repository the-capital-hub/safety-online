import crypto from "crypto";
import { NextResponse } from "next/server";
import Order from "@/model/Order";
import Product from "@/model/Product";
import Cart from "@/model/Cart";
import { dbConnect } from "@/lib/dbConnect.js";

export async function POST(req) {
	try {
		await dbConnect();

		const body = await req.json();
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			orderData,
			userId,
			clearCart = false,
		} = body;

		// Verify signature
		const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
		hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
		const generatedSignature = hmac.digest("hex");

		if (generatedSignature !== razorpay_signature) {
			return NextResponse.json(
				{ success: false, error: "Invalid payment signature" },
				{ status: 400 }
			);
		}

		// Create order in database
		const order = new Order({
			...orderData,
			transactionId: razorpay_payment_id,
			paymentStatus: "paid",
			status: "confirmed",
		});

		await order.save();

		// Update product stocks
		for (const item of orderData.products) {
			await Product.findByIdAndUpdate(item.productId, {
				$inc: { stocks: -item.quantity },
			});
		}

		// Clear cart if it's a cart checkout
		if (clearCart && userId) {
			await Cart.findOneAndUpdate(
				{ user: userId },
				{ products: [], totalPrice: 0, appliedPromo: null }
			);
		}

		return NextResponse.json({
			success: true,
			orderId: order._id,
			orderNumber: order.orderNumber,
			order: order,
		});
	} catch (error) {
		console.error("Payment verification error:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
