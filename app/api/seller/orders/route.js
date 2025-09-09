import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import SubOrder from "@/model/SubOrder.js";
import mongoose from "mongoose";
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

		const skip = (page - 1) * limit;

		// Build aggregation pipeline for efficient filtering
		let pipeline = [
			{ $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
			{
				$lookup: {
					from: "orders",
					localField: "orderId",
					foreignField: "_id",
					as: "orderData",
				},
			},
			{ $unwind: "$orderData" },
			{
				$lookup: {
					from: "products",
					localField: "products.productId",
					foreignField: "_id",
					as: "productData",
				},
			},
		];

		// Add search match stage if search term provided
		if (search) {
			pipeline.push({
				$match: {
					$or: [
						{ "orderData.orderNumber": { $regex: search, $options: "i" } },
						{ "orderData.customerName": { $regex: search, $options: "i" } },
						{ "orderData.customerEmail": { $regex: search, $options: "i" } },
						{ "products.productName": { $regex: search, $options: "i" } },
						{ "productData.name": { $regex: search, $options: "i" } },
					],
				},
			});
		}

		// Add payment method filter
		if (paymentMethod && paymentMethod !== "all") {
			if (paymentMethod === "cod") {
				pipeline.push({
					$match: { "orderData.paymentMethod": "cod" },
				});
			} else if (paymentMethod === "prepaid") {
				pipeline.push({
					$match: {
						"orderData.paymentMethod": {
							$in: [
								"razorpay",
								"credit_card",
								"debit_card",
								"net_banking",
								"upi",
								"wallet",
							],
						},
					},
				});
			} else {
				pipeline.push({
					$match: { "orderData.paymentMethod": paymentMethod },
				});
			}
		}

		// Add status filter
		if (status && status !== "all") {
			pipeline.push({
				$match: { status: status },
			});
		}

		// Add date range filter
		if (startDate && endDate) {
			pipeline.push({
				$match: {
					createdAt: {
						$gte: new Date(startDate),
						$lte: new Date(endDate),
					},
				},
			});
		}

		// Get total count for pagination (before adding sort, skip, limit)
		const countPipeline = [...pipeline];
		countPipeline.push({ $count: "total" });
		const totalResult = await SubOrder.aggregate(countPipeline);
		const total = totalResult[0]?.total || 0;

		// Add sorting, skip, and limit to main pipeline
		pipeline.push(
			{ $sort: { createdAt: -1 } },
			{ $skip: skip },
			{ $limit: limit }
		);

		// Add projection to format the output properly
		pipeline.push({
			$project: {
				_id: 1,
				orderId: "$orderData",
				sellerId: 1,
				products: {
					$map: {
						input: "$products",
						as: "product",
						in: {
							productId: {
								$arrayElemAt: [
									{
										$filter: {
											input: "$productData",
											cond: { $eq: ["$$this._id", "$$product.productId"] },
										},
									},
									0,
								],
							},
							productName: "$$product.productName",
							productImage: "$$product.productImage",
							quantity: "$$product.quantity",
							price: "$$product.price",
							totalPrice: "$$product.totalPrice",
						},
					},
				},
				subtotal: 1,
				tax: 1,
				shippingCost: 1,
				discount: 1,
				totalAmount: 1,
				couponApplied: 1,
				trackingNumber: 1,
				estimatedDelivery: 1,
				actualDelivery: 1,
				status: 1,
				orderNotes: 1,
				createdAt: 1,
				updatedAt: 1,
			},
		});

		// Execute aggregation
		const orders = await SubOrder.aggregate(pipeline);

		// Calculate statistics for seller using separate aggregation
		const stats = await SubOrder.aggregate([
			{ $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
			{
				$group: {
					_id: null,
					totalOrders: { $sum: 1 },
					totalRevenue: { $sum: "$totalAmount" },
					pendingOrders: {
						$sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
					},
					confirmedOrders: {
						$sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
					},
					processingOrders: {
						$sum: { $cond: [{ $eq: ["$status", "processing"] }, 1, 0] },
					},
					shippedOrders: {
						$sum: { $cond: [{ $eq: ["$status", "shipped"] }, 1, 0] },
					},
					deliveredOrders: {
						$sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
					},
					cancelledOrders: {
						$sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
					},
					returnedOrders: {
						$sum: { $cond: [{ $eq: ["$status", "returned"] }, 1, 0] },
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
				confirmedOrders: 0,
				processingOrders: 0,
				shippedOrders: 0,
				deliveredOrders: 0,
				cancelledOrders: 0,
				returnedOrders: 0,
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
