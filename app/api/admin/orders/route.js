import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";

export async function GET(request) {
	try {
		await dbConnect();

		const { searchParams } = new URL(request.url);
		const page = Number.parseInt(searchParams.get("page")) || 1;
		const limit = Number.parseInt(searchParams.get("limit")) || 10;
		const search = searchParams.get("search") || "";
		const status = searchParams.get("status") || "";
		const paymentMethod = searchParams.get("paymentMethod") || "";
		const startDate = searchParams.get("startDate");
		const endDate = searchParams.get("endDate");

		// Build query
		const query = {};

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
			query.paymentMethod = paymentMethod;
		}

		if (startDate && endDate) {
			query.orderDate = {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			};
		}

		const skip = (page - 1) * limit;

		const orders = await Order.find(query)
			// .populate("subOrders", "products")
			.sort({ orderDate: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Order.countDocuments(query);

		// Calculate statistics
		const stats = await Order.aggregate([
			{
				$group: {
					_id: null,
					totalOrders: { $sum: 1 },
					totalRevenue: { $sum: "$totalAmount" },
					pendingOrders: {
						$sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
					},
					completedOrders: {
						$sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
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
				completedOrders: 0,
			},
		});
	} catch (error) {
		console.error("Error fetching orders:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch orders" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	try {
		await dbConnect();

		const orderData = await request.json();

		// Validate required fields
		const requiredFields = [
			"userId",
			"customerName",
			"customerEmail",
			"products",
			"totalAmount",
			"paymentMethod",
		];
		for (const field of requiredFields) {
			if (!orderData[field]) {
				return NextResponse.json(
					{ success: false, message: `${field} is required` },
					{ status: 400 }
				);
			}
		}

		// Calculate totals
		let subtotal = 0;
		for (const product of orderData.products) {
			product.totalPrice = product.price * product.quantity;
			subtotal += product.totalPrice;
		}

		orderData.subtotal = subtotal;
		orderData.totalAmount =
			subtotal +
			(orderData.tax || 0) +
			(orderData.shippingCost || 0) -
			(orderData.discount || 0);

		const order = new Order(orderData);
		await order.save();

		await order.populate("userId", "firstName lastName email");
		await order.populate("products.productId", "name images");

		return NextResponse.json({
			success: true,
			message: "Order created successfully",
			order,
		});
	} catch (error) {
		console.error("Error creating order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to create order" },
			{ status: 500 }
		);
	}
}
