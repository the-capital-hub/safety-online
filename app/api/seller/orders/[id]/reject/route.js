import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import SubOrder from "@/model/SubOrder.js";
import jwt from "jsonwebtoken";

export async function PUT(request, { params }) {
	try {
		await dbConnect();

		// Get token from cookies
		const token = request.cookies.get("seller-auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const sellerId = decoded.userId;

		const order = await SubOrder.findOneAndUpdate(
			{ _id: params.id, sellerId },
			{ status: "cancelled" },
			{ new: true, runValidators: true }
		)
			.populate(
				"orderId",
				"orderNumber orderDate paymentMethod customerName customerEmail"
			)
			.populate("products.productId", "name images price");

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found or unauthorized" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Order rejected successfully",
			order,
		});
	} catch (error) {
		console.error("Error rejecting order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to reject order" },
			{ status: 500 }
		);
	}
}
