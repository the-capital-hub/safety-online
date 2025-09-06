import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";
import jwt from "jsonwebtoken";

export async function GET(request, { params }) {
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

		const order = await Order.findOne({ _id: params.id, sellerId })
			.populate("userId", "firstName lastName email")
			.populate("products.productId", "name images price");

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found or unauthorized" },
				{ status: 404 }
			);
		}

		if (order.status !== "processing") {
			return NextResponse.json(
				{
					success: false,
					message: "Order must be accepted to download shipment receipt",
				},
				{ status: 400 }
			);
		}

		// Generate PDF receipt (simplified version)
		// In a real application, you would use a PDF library like jsPDF.
		const receiptData = {
			orderNumber: order.orderNumber,
			customerName: order.customerName,
			products: order.products,
			totalAmount: order.totalAmount,
			deliveryAddress: order.deliveryAddress,
			orderDate: order.orderDate,
		};

		// For now, return JSON data - replace with actual PDF generation
		return NextResponse.json({
			success: true,
			message: "Shipment receipt generated",
			receipt: receiptData,
		});
	} catch (error) {
		console.error("Error generating shipment receipt:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to generate shipment receipt" },
			{ status: 500 }
		);
	}
}
