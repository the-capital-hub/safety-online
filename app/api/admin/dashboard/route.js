import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order";
import Product from "@/model/Product";
import User from "@/model/User";

export async function GET() {
	try {
		await dbConnect();

		// Get current date and calculate date ranges
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
		const startOfYear = new Date(now.getFullYear(), 0, 1);
		const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		// Orders Statistics
		const [
			totalOrders,
			monthlyOrders,
			lastMonthOrders,
			pendingOrders,
			completedOrders,
			cancelledOrders,
			totalRevenue,
			monthlyRevenue,
			lastMonthRevenue,
		] = await Promise.all([
			Order.countDocuments(),
			Order.countDocuments({ orderDate: { $gte: startOfMonth } }),
			Order.countDocuments({
				orderDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
			}),
			Order.countDocuments({ status: "pending" }),
			Order.countDocuments({ status: "delivered" }),
			Order.countDocuments({ status: "cancelled" }),
			Order.aggregate([
				{ $group: { _id: null, total: { $sum: "$totalAmount" } } },
			]),
			Order.aggregate([
				{ $match: { orderDate: { $gte: startOfMonth } } },
				{ $group: { _id: null, total: { $sum: "$totalAmount" } } },
			]),
			Order.aggregate([
				{
					$match: {
						orderDate: { $gte: startOfLastMonth, $lte: endOfLastMonth },
					},
				},
				{ $group: { _id: null, total: { $sum: "$totalAmount" } } },
			]),
		]);

		// Products Statistics
		const [
			totalProducts,
			publishedProducts,
			outOfStockProducts,
			lowStockProducts,
		] = await Promise.all([
			Product.countDocuments(),
			Product.countDocuments({ published: true }),
			Product.countDocuments({ inStock: false }),
			Product.countDocuments({ stocks: { $lt: 10, $gt: 0 } }),
		]);

		// Users Statistics
		const [
			totalCustomers,
			activeCustomers,
			totalSellers,
			activeSellers,
			newCustomersThisMonth,
			newSellersThisMonth,
		] = await Promise.all([
			User.countDocuments({ userType: "customer" }),
			User.countDocuments({ userType: "customer", status: "active" }),
			User.countDocuments({ userType: "seller" }),
			User.countDocuments({ userType: "seller", status: "active" }),
			User.countDocuments({
				userType: "customer",
				createdAt: { $gte: startOfMonth },
			}),
			User.countDocuments({
				userType: "seller",
				createdAt: { $gte: startOfMonth },
			}),
		]);

		// Orders by Status for Chart
		const ordersByStatus = await Order.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
		]);

		// Monthly Orders Chart Data (Last 12 months)
		const monthlyOrdersChart = await Order.aggregate([
			{
				$match: {
					orderDate: {
						$gte: new Date(now.getFullYear() - 1, now.getMonth(), 1),
					},
				},
			},
			{
				$group: {
					_id: {
						year: { $year: "$orderDate" },
						month: { $month: "$orderDate" },
					},
					orders: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{
				$sort: { "_id.year": 1, "_id.month": 1 },
			},
		]);

		// Daily Orders for Last 30 Days
		const dailyOrders = await Order.aggregate([
			{
				$match: {
					orderDate: { $gte: last30Days },
				},
			},
			{
				$group: {
					_id: {
						year: { $year: "$orderDate" },
						month: { $month: "$orderDate" },
						day: { $dayOfMonth: "$orderDate" },
					},
					orders: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{
				$sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
			},
		]);

		// Top Selling Products
		const topProducts = await Order.aggregate([
			{ $unwind: "$products" },
			{
				$group: {
					_id: "$products.productId",
					totalSold: { $sum: "$products.quantity" },
					revenue: { $sum: "$products.totalPrice" },
					productName: { $first: "$products.productName" },
				},
			},
			{ $sort: { totalSold: -1 } },
			{ $limit: 5 },
		]);

		// Recent Orders
		const recentOrders = await Order.find()
			.populate("userId", "firstName lastName")
			.sort({ orderDate: -1 })
			.limit(5)
			.select("orderNumber customerName totalAmount status orderDate");

		// Calculate growth percentages
		const ordersGrowth =
			lastMonthOrders[0]?.count > 0
				? (((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(
						1
				  )
				: 0;

		const revenueGrowth =
			lastMonthRevenue[0]?.total > 0
				? (
						((monthlyRevenue[0]?.total || 0 - lastMonthRevenue[0]?.total) /
							lastMonthRevenue[0]?.total) *
						100
				  ).toFixed(1)
				: 0;

		return NextResponse.json({
			success: true,
			data: {
				// Overview Stats
				overview: {
					totalOrders,
					monthlyOrders,
					ordersGrowth: Number.parseFloat(ordersGrowth),
					totalRevenue: totalRevenue[0]?.total || 0,
					monthlyRevenue: monthlyRevenue[0]?.total || 0,
					revenueGrowth: Number.parseFloat(revenueGrowth),
					totalProducts,
					publishedProducts,
					totalCustomers,
					activeCustomers,
				},

				// Orders Stats
				orders: {
					total: totalOrders,
					pending: pendingOrders,
					completed: completedOrders,
					cancelled: cancelledOrders,
					byStatus: ordersByStatus,
					recent: recentOrders,
				},

				// Products Stats
				products: {
					total: totalProducts,
					published: publishedProducts,
					outOfStock: outOfStockProducts,
					lowStock: lowStockProducts,
					top: topProducts,
				},

				// Users Stats
				users: {
					customers: {
						total: totalCustomers,
						active: activeCustomers,
						newThisMonth: newCustomersThisMonth,
					},
					sellers: {
						total: totalSellers,
						active: activeSellers,
						newThisMonth: newSellersThisMonth,
					},
				},

				// Chart Data
				charts: {
					monthlyOrders: monthlyOrdersChart,
					dailyOrders: dailyOrders,
					ordersByStatus: ordersByStatus,
				},
			},
		});
	} catch (error) {
		console.error("Dashboard API Error:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch dashboard data" },
			{ status: 500 }
		);
	}
}
