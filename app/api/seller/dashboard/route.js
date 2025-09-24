import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbConnect";
import Product from "@/model/Product";
import SubOrder from "@/model/SubOrder";

const MONTH_LABELS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

export async function GET() {
	try {
		await dbConnect();

		const cookieStore = await cookies();
		const token = cookieStore.get("seller-auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 }
			);
		}

		if (!process.env.JWT_SECRET) {
			return NextResponse.json(
				{ success: false, message: "Server configuration error" },
				{ status: 500 }
			);
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		} catch (error) {
			return NextResponse.json(
				{ success: false, message: "Invalid token" },
				{ status: 401 }
			);
		}

		const sellerId = decoded.userId || decoded.id;
		if (!sellerId) {
			return NextResponse.json(
				{ success: false, message: "Invalid token payload" },
				{ status: 401 }
			);
		}

		const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

		const [
			totalOrdersCount,
			totalSalesAgg,
			productCount,
			customerAgg,
			statusAgg,
			paymentSummaryAgg,
			recentOrders,
			returnsAgg,
		] = await Promise.all([
			SubOrder.countDocuments({ sellerId: sellerObjectId }),
			SubOrder.aggregate([
				{
					$match: {
						sellerId: sellerObjectId,
						status: { $nin: ["cancelled"] },
					},
				},
				{
					$group: {
						_id: null,
						total: { $sum: { $ifNull: ["$totalAmount", 0] } },
					},
				},
			]),
			Product.countDocuments({ sellerId: sellerObjectId }),
			SubOrder.aggregate([
				{ $match: { sellerId: sellerObjectId } },
				{
					$lookup: {
						from: "orders",
						localField: "orderId",
						foreignField: "_id",
						as: "order",
					},
				},
				{ $unwind: "$order" },
				{ $group: { _id: "$order.userId" } },
				{ $count: "count" },
			]),
			SubOrder.aggregate([
				{ $match: { sellerId: sellerObjectId } },
				{ $group: { _id: "$status", count: { $sum: 1 } } },
			]),
			SubOrder.aggregate([
				{
					$match: {
						sellerId: sellerObjectId,
						status: { $nin: ["cancelled"] },
						createdAt: {
							$gte: new Date(new Date().getFullYear(), 0, 1),
						},
					},
				},
				{
					$group: {
						_id: {
							year: { $year: "$createdAt" },
							month: { $month: "$createdAt" },
						},
						total: { $sum: { $ifNull: ["$totalAmount", 0] } },
					},
				},
				{ $sort: { "_id.year": 1, "_id.month": 1 } },
			]),
			SubOrder.aggregate([
				{ $match: { sellerId: sellerObjectId } },
				{
					$lookup: {
						from: "orders",
						localField: "orderId",
						foreignField: "_id",
						as: "order",
					},
				},
				{ $unwind: "$order" },
				{ $sort: { createdAt: -1 } },
				{ $limit: 5 },
				{
					$project: {
						_id: 1,
						createdAt: 1,
						status: 1,
						totalAmount: { $ifNull: ["$totalAmount", 0] },
						paymentMethod: "$order.paymentMethod",
						orderNumber: "$order.orderNumber",
						customerName: {
							$ifNull: [
								"$order.customerName",
								{
									$cond: [
										{ $and: ["$order.customerEmail", "$order.customerEmail"] },
										"$order.customerEmail",
										"Customer",
									],
								},
							],
						},
						itemsCount: { $size: { $ifNull: ["$products", []] } },
					},
				},
			]),
			SubOrder.aggregate([
				{
					$match: {
						sellerId: sellerObjectId,
						status: "returned",
					},
				},
				{
					$group: {
						_id: "$status",
						count: { $sum: 1 },
					},
				},
			]),
		]);

		const totalSales = Number(totalSalesAgg[0]?.total || 0);
		const totalCustomers = customerAgg[0]?.count || 0;

		const statusCounts = statusAgg.reduce(
			(acc, item) => {
				acc[item._id] = item.count;
				acc.total += item.count;
				return acc;
			},
			{ total: 0 }
		);

		const toPercent = (value) => {
			if (!statusCounts.total) return 0;
			return Math.round((value / statusCounts.total) * 100);
		};

		const orderSummary = {
			pendingPercent: toPercent(statusCounts.pending || 0),
			processingPercent: toPercent(
				(statusCounts.processing || 0) + (statusCounts.confirmed || 0)
			),
			shippedPercent: toPercent(statusCounts.shipped || 0),
			deliveredPercent: toPercent(statusCounts.delivered || 0),
			cancelledPercent: toPercent(statusCounts.cancelled || 0),
		};

		const paymentSummaryMap = paymentSummaryAgg.reduce((acc, item) => {
			const monthIndex = item._id.month - 1;
			acc[monthIndex] = Number(item.total || 0);
			return acc;
		}, {});

		const paymentSummary = MONTH_LABELS.map((label, index) => ({
			label,
			value: paymentSummaryMap[index] || 0,
		}));

		const returnsSummary = returnsAgg.reduce(
			(acc, item) => {
				acc.total += item.count;
				acc.status[item._id] = item.count;
				return acc;
			},
			{ total: 0, status: {} }
		);

		return NextResponse.json({
			success: true,
			stats: {
				totalOrders: totalOrdersCount,
				totalSales,
				totalProducts: productCount,
				totalCustomers,
			},
			orderSummary,
			paymentSummary,
			recentOrders: recentOrders.map((order) => ({
				id: order._id.toString(),
				orderNumber: order.orderNumber,
				createdAt: order.createdAt,
				status: order.status,
				totalAmount: Number(order.totalAmount || 0),
				paymentMethod: order.paymentMethod || "prepaid",
				customerName: order.customerName ?? "Customer",
				itemsCount: order.itemsCount,
			})),
			returnsSummary,
		});
	} catch (error) {
		console.error("Seller dashboard error:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to load dashboard" },
			{ status: 500 }
		);
	}
}
