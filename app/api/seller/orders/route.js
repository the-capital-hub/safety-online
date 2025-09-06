import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";
import jwt from "jsonwebtoken";

export async function GET(request) {
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

		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page")) || 1;
		const limit = Number.parseInt(searchParams.get("limit")) || 10;
		const search = searchParams.get("search") || "";
		const status = searchParams.get("status") || "";
		const paymentMethod = searchParams.get("paymentMethod") || "";
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		// Build query for seller's orders
		const query = { sellerId };

		if (search) {
			query.$or = [
				{ orderNumber: { $regex: search, $options: "i" } },
				{ customerName: { $regex: search, $options: "i" } },
				{ customerEmail: { $regex: search, $options: "i" } },
			];
		}

		if (status && status !== "all") {
			query.status = status;
		}

		if (paymentMethod && paymentMethod !== "all") {
			// Map payment methods to simplified versions
			if (paymentMethod === "cod") {
				query.paymentMethod = "cod";
			} else if (paymentMethod === "prepaid") {
				query.paymentMethod = {
					$in: [
						"razorpay",
						"credit_card",
						"debit_card",
						"net_banking",
						"upi",
						"wallet",
					],
				};
			}
		}

		if (startDate && endDate) {
			query.orderDate = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		}

		const skip = (page - 1) * limit;

		const orders = await Order.find(query)
			.populate("userId", "firstName lastName email")
			.populate("products.productId", "name images price")
			.sort({ orderDate: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Order.countDocuments(query);

		// Calculate statistics for seller
		const stats = await Order.aggregate([
			{ $match: { sellerId } },
			{
				$group: {
					_id: null,
					totalOrders: { $sum: 1 },
					totalRevenue: { $sum: "$totalAmount" },
					pendingOrders: {
						$sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
					},
					acceptedOrders: {
						$sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
					},
				},
			},
		]);

		return NextResponse.json({
			success: true,
			orders,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(total / limit),
				totalOrders: total,
				hasNext: page < Math.ceil(total / limit),
				hasPrev: page > 1,
			},
			stats: stats[0] || {
				totalOrders: 0,
				totalRevenue: 0,
				pendingOrders: 0,
				acceptedOrders: 0,
			},
		});
	} catch (error) {
		console.error("Error fetching seller orders:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}
