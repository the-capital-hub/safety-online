import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/model/Order.js";
import SubOrder from "@/model/SubOrder.js";
import Product from "@/model/Product.js";
import Cart from "@/model/Cart.js";
import { dbConnect } from "@/lib/dbConnect.js";

// Helper to calculate totals for sub-orders
function calculateTotals(items, discountPercentage = 0) {
	const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
	const discount = (subtotal * discountPercentage) / 100;
	const discountedSubtotal = subtotal - discount;
	const tax = discountedSubtotal * 0.18;
	const shippingCost = discountedSubtotal >= 500 ? 0 : 50;
	const totalAmount = discountedSubtotal + tax + shippingCost;

	return {
		subtotal,
		tax: Math.round(tax * 100) / 100, // Round to 2 decimal places
		shippingCost,
		discount: Math.round(discount * 100) / 100,
		totalAmount: Math.round(totalAmount * 100) / 100,
	};
}

export async function POST(req) {
	const session = await mongoose.startSession();

	try {
		await dbConnect();
		await session.startTransaction();

		const body = await req.json();
		const { orderData, userId, clearCart = false } = body;

		// Validation
		if (!orderData || !orderData.products?.length) {
			throw new Error("No products in order");
		}

		if (!userId) {
			throw new Error("User  ID is required");
		}

		console.log("Starting order creation process...");

		// 1️⃣ Create Parent Order
		const orderPayload = {
			orderNumber: `ORD-${Date.now()}-${Math.random()
				.toString(36)
				.substr(2, 9)}`,
			userId,
			customerName: orderData.customerName,
			customerEmail: orderData.customerEmail,
			customerMobile: orderData.customerMobile,
			subtotal: orderData.subtotal || 0,
			tax: orderData.tax || 0,
			shippingCost: orderData.shippingCost || 0,
			discount: orderData.discount || 0,
			totalAmount: orderData.totalAmount || 0,
			couponApplied: orderData.couponApplied || null,
			paymentMethod: orderData.paymentMethod,
			paymentStatus: orderData.paymentStatus || "pending",
			transactionId: orderData.transactionId || null,
			deliveryAddress: orderData.deliveryAddress,
			status: "pending",
			subOrders: [], // Initialize as empty, will be updated later
		};

		const [order] = await Order.create([orderPayload], { session });
		console.log("Parent Order created with ID:", order._id);

		// 2️⃣ Group products by sellerId and validate stock
		const productsBySeller = {};
		const stockUpdates = []; // Track stock updates for rollback if needed

		for (const item of orderData.products) {
			// Fetch product with stock info
			const product = await Product.findById(item.productId)
				.select("sellerId stocks title")
				.session(session);

			if (!product) {
				throw new Error(`Product not found: ${item.productId}`);
			}

			// Check stock availability
			if (product.stocks < item.quantity) {
				throw new Error(
					`Insufficient stock for product: ${product.title}. Available: ${product.stocks}, Requested: ${item.quantity}`
				);
			}

			const sellerId = product.sellerId.toString();

			if (!productsBySeller[sellerId]) {
				productsBySeller[sellerId] = [];
			}

			productsBySeller[sellerId].push({
				...item,
				sellerId: product.sellerId,
				productName: product.title,
			});

			// Track stock update for this product
			stockUpdates.push({
				productId: item.productId,
				quantityToDeduct: item.quantity,
				originalStock: product.stocks,
			});
		}

		console.log(
			`Products grouped by ${Object.keys(productsBySeller).length} sellers`
		);

		// 3️⃣ Update product stocks
		const bulkOps = stockUpdates.map((update) => ({
			updateOne: {
				filter: { _id: update.productId },
				update: { $inc: { stocks: -update.quantityToDeduct } },
			},
		}));

		if (bulkOps.length > 0) {
			await Product.bulkWrite(bulkOps, { session });
			console.log("Product stocks updated");
		}

		// 4️⃣ Create SubOrders for each seller
		const subOrderData = [];
		const subOrderIds = [];

		for (const [sellerId, items] of Object.entries(productsBySeller)) {
			const totals = calculateTotals(items);

			const subOrderPayload = {
				orderId: order._id, // Link to the parent order
				sellerId,
				products: items.map((item) => ({
					productId: item.productId,
					productName: item.productName || item.productName,
					productImage: item.productImage || "",
					quantity: item.quantity,
					price: item.price,
					totalPrice: item.totalPrice,
				})),
				subtotal: totals.subtotal,
				tax: totals.tax,
				shippingCost: totals.shippingCost,
				discount: totals.discount,
				totalAmount: totals.totalAmount,
				couponApplied: orderData.couponApplied || null,
				status: "pending",
			};

			subOrderData.push(subOrderPayload);
		}

		// Create all suborders in batch
		const createdSubOrders = await SubOrder.create(subOrderData, { session });
		createdSubOrders.forEach((subOrder) => {
			// Ensure the ID is a Mongoose ObjectId
			subOrderIds.push(new mongoose.Types.ObjectId(subOrder._id));
		});

		console.log(
			`${createdSubOrders.length} SubOrders created. IDs:`,
			subOrderIds
		);

		// 5️⃣ Update parent order with subOrder IDs
		if (subOrderIds.length > 0) {
			const updatedOrder = await Order.findByIdAndUpdate(
				order._id,
				{ $set: { subOrders: subOrderIds } },
				{
					new: true,
					runValidators: true,
					session,
				}
			);
			console.log(
				"Parent order updated with subOrders. Count:",
				updatedOrder.subOrders.length
			);
			console.log(
				"Updated parent order's subOrders array:",
				updatedOrder.subOrders
			);
		} else {
			console.log("No subOrders to update in parent order.");
		}

		// 6️⃣ Clear cart if requested
		if (clearCart && userId) {
			await Cart.findOneAndUpdate(
				{ user: userId },
				{
					products: [],
					totalPrice: 0,
					appliedPromo: null,
				},
				{ session }
			);
			console.log("Cart cleared for user:", userId);
		}

		// Commit transaction
		await session.commitTransaction();
		console.log("Order creation completed successfully");

		// Fetch the final order to ensure subOrders are populated for the response
		const finalOrder = await Order.findById(order._id)
			.populate({
				path: "subOrders",
				select: "_id", // Only fetch _id for subOrders in this context
			})
			.session(session);

		return NextResponse.json({
			success: true,
			orderId: finalOrder._id,
			orderNumber: finalOrder.orderNumber,
			subOrdersCount: finalOrder.subOrders?.length || 0,
			order: {
				...finalOrder.toObject(),
				subOrderIds: finalOrder.subOrders?.map((sub) => sub._id) || [],
			},
		});
	} catch (error) {
		// Rollback transaction on error
		await session.abortTransaction();
		console.error("Order creation failed:", error.message);
		console.error("Full error:", error);

		return NextResponse.json(
			{
				success: false,
				error: error.message,
				details:
					process.env.NODE_ENV === "development" ? error.stack : undefined,
			},
			{ status: 500 }
		);
	} finally {
		// End session
		await session.endSession();
	}
}

// GET function remains unchanged
export async function GET(req) {
	try {
		await dbConnect();

		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");
		const orderId = searchParams.get("orderId");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "10");

		// Build query
		const query = {};
		if (userId) query.userId = userId;
		if (orderId) query._id = orderId;

		const skip = (page - 1) * limit;

		// Fetch orders with populated subOrders
		const orders = await Order.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate({
				path: "subOrders",
				populate: [
					{
						path: "products.productId",
						select: "title images price category",
					},
					{
						path: "sellerId",
						select: "name email businessName",
					},
				],
			})
			.lean();

		const total = await Order.countDocuments(query);

		const ordersWithDebug = orders.map((order) => ({
			...order,
			subOrdersCount: order.subOrders?.length || 0,
			hasSubOrders: Boolean(order.subOrders?.length),
		}));

		return NextResponse.json({
			success: true,
			orders: ordersWithDebug,
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
			{
				success: false,
				error: error.message,
				details:
					process.env.NODE_ENV === "development" ? error.stack : undefined,
			},
			{ status: 500 }
		);
	}
}
