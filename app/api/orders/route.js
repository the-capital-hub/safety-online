import { NextResponse } from "next/server";
import Order from "@/model/Order";
import Product from "@/model/Product";
import Cart from "@/model/Cart";
import { dbConnect } from "@/lib/dbConnect.js";

export async function POST(req) {
	try {
		await dbConnect();

		const body = await req.json();
		const { orderData, userId, clearCart = false } = body;

		// Create order in database
		const order = new Order({
			...orderData,
			orderNumber: `ORD-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`,
		});

		await order.save();

		// Update product stocks
		for (const item of orderData.products) {
			await Product.findByIdAndUpdate(item.productId, {
				$inc: { stocks: -item.quantity },
			});
		}

		// Clear cart if requested
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
		console.error("Order creation error:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}

export async function GET(req) {
	try {
		await dbConnect();

		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");

		const query = userId ? { userId } : {};
		const skip = (page - 1) * limit;

		const orders = await Order.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate("products.productId", "title images");

		const total = await Order.countDocuments(query);

		return NextResponse.json({
			success: true,
			orders,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(total / limit),
				totalOrders: total,
				hasNextPage: page < Math.ceil(total / limit),
				hasPrevPage: page > 1,
			},
		});
	} catch (error) {
		console.error("Orders fetch error:", error);
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
