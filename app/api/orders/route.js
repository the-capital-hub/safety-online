import { NextResponse } from "next/server";
import Order from "@/model/Order.js";
import { dbConnect } from "@/lib/dbConnect.js";
import { createOrderWithSubOrders } from "@/lib/orders/createOrder.js";

export async function POST(req) {
        try {
                await dbConnect();

                const body = await req.json();
                const { orderData, userId, clearCart = false } = body;

                const { order, orderId, orderNumber, subOrderIds } = await createOrderWithSubOrders({
                        orderData,
                        userId,
                        clearCart,
                        orderStatus: orderData?.status,
                        reserveInventory: orderData?.paymentStatus !== "failed",
                });

                const orderObject = order.toObject();

                return NextResponse.json({
                        success: true,
                        orderId,
                        orderNumber,
                        order: {
                                ...orderObject,
                                subOrderIds,
                        },
                });
        } catch (error) {
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
        }
}

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
