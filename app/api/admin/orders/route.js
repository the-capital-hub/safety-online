import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import { calculateGstTotals, determineGstMode, GST_RATE_PERCENT } from "@/lib/utils/gst.js";
import Order from "@/model/Order.js";
import ReturnRequest from "@/model/ReturnRequest.js";

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
                const invoiceType = searchParams.get("invoiceType") || "all";

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

                if (invoiceType === "business") {
                        query["billingInfo.gstInvoiceRequested"] = true;
                } else if (invoiceType === "standard") {
                        query["billingInfo.gstInvoiceRequested"] = { $ne: true };
                }

		const skip = (page - 1) * limit;

                const orders = await Order.find(query)
                        .sort({ orderDate: -1 })
                        .skip(skip)
                        .limit(limit)
                        .populate({
                                path: "subOrders",
                                select: "shipmentPackage sellerId status totalAmount",
                        })
                        .lean({ virtuals: true });

                const total = await Order.countDocuments(query);

                const orderIds = orders.map((order) => order._id);
                const returnRequests = await ReturnRequest.find({ orderId: { $in: orderIds } })
                        .sort({ createdAt: -1 })
                        .lean();

                const requestsByOrder = returnRequests.reduce((acc, request) => {
                        const key = request.orderId?.toString();
                        if (!key) {
                                return acc;
                        }
                        if (!acc.has(key)) {
                                acc.set(key, []);
                        }
                        acc.get(key).push(request);
                        return acc;
                }, new Map());

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

                const ordersWithReturns = orders.map((order) => {
                        const orderId = order._id?.toString?.() ?? "";
                        const hasShipmentAttention = Array.isArray(order.subOrders)
                                ? order.subOrders.some(
                                          (subOrder) =>
                                                  subOrder?.shipmentPackage?.requiresAttention === true
                                  )
                                : false;

                        return {
                                ...order,
                                hasShipmentAttention,
                                returnRequests: requestsByOrder.get(orderId) || [],
                        };
                });

                return NextResponse.json({
                        success: true,
                        orders: ordersWithReturns,
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

                const sanitizeAmount = (value) => {
                        const numeric = Number(value);
                        return Number.isFinite(numeric) ? numeric : 0;
                };

                let subtotal = 0;
                orderData.products = orderData.products.map((product) => {
                        const quantity = sanitizeAmount(product.quantity);
                        const price = sanitizeAmount(product.price);
                        const totalPrice = price * quantity;

                        subtotal += totalPrice;

                        return {
                                ...product,
                                quantity,
                                price,
                                totalPrice,
                        };
                });

                const discountValue = sanitizeAmount(orderData.discount);
                const shippingCostValue = sanitizeAmount(orderData.shippingCost);
                const gstRate = Number.isFinite(Number(orderData?.gst?.rate))
                        ? Number(orderData.gst.rate)
                        : GST_RATE_PERCENT;
                const gstMode = orderData?.gst?.mode || determineGstMode(orderData.deliveryAddress);

                const totals = calculateGstTotals({
                        subtotal,
                        discount: discountValue,
                        shippingCost: shippingCostValue,
                        address: orderData.deliveryAddress,
                        gstMode,
                        gstRatePercent: gstRate,
                });

                orderData.subtotal = totals.subtotal;
                orderData.discount = totals.discount;
                orderData.shippingCost = totals.shippingCost;
                orderData.totalAmount = totals.total;
                orderData.tax = totals.gst.total;
                orderData.taxableAmount = totals.taxableAmount;
                orderData.gst = {
                        ...totals.gst,
                        mode: gstMode,
                        rate: gstRate,
                };

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
