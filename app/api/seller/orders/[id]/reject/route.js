import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { companyInfo } from "@/constants/companyInfo.js";
import { dbConnect } from "@/lib/dbConnect.js";
import { sendOrderCancellationEmail } from "@/lib/orders/email.js";
import Order from "@/model/Order.js";
import SubOrder from "@/model/SubOrder.js";

export async function PUT(request, { params }) {
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

                const subOrder = await SubOrder.findOne({ _id: params.id, sellerId })
                        .populate(
                                "orderId",
                                "orderNumber orderDate paymentMethod customerName customerEmail status"
                        )
                        .populate("sellerId", "name businessName")
                        .populate("products.productId", "name title images price");

                if (!subOrder) {
                        return NextResponse.json(
                                { success: false, message: "Order not found or unauthorized" },
                                { status: 404 }
                        );
                }

                const wasAlreadyCancelled = subOrder.status === "cancelled";

                if (!wasAlreadyCancelled) {
                        subOrder.status = "cancelled";
                        await subOrder.save();
                }

                const orderId = subOrder.orderId?._id || subOrder.orderId;

                const parentOrder = orderId
                        ? await Order.findById(orderId)
                                  .populate("userId", "firstName lastName email")
                                  .populate({
                                          path: "subOrders",
                                          populate: [
                                                  {
                                                          path: "products.productId",
                                                          select: "name title images price",
                                                  },
                                                  {
                                                          path: "sellerId",
                                                          select: "name businessName",
                                                  },
                                          ],
                                  })
                        : null;

                if (parentOrder) {
                        const allCancelled = parentOrder.subOrders.every(
                                (item) => item.status === "cancelled"
                        );

                        if (allCancelled && parentOrder.status !== "cancelled") {
                                parentOrder.status = "cancelled";
                                await parentOrder.save();
                        }
                }

                if (!wasAlreadyCancelled && parentOrder) {
                        const adminCc = companyInfo.adminEmail ? [companyInfo.adminEmail] : undefined;

                        try {
                                await sendOrderCancellationEmail({
                                        order: parentOrder,
                                        subOrder,
                                        to: parentOrder.customerEmail || parentOrder.userId?.email,
                                        cc: adminCc,
                                        cancelledBy: "seller",
                                });
                        } catch (emailError) {
                                console.error("Error sending cancellation email:", emailError);
                        }
                }

                const responseOrder = parentOrder
                        ? await Order.findById(parentOrder._id)
                                  .populate("userId", "firstName lastName email")
                                  .populate({
                                          path: "subOrders",
                                          populate: [
                                                  {
                                                          path: "products.productId",
                                                          select: "name title images price",
                                                  },
                                                  {
                                                          path: "sellerId",
                                                          select: "name businessName",
                                                  },
                                          ],
                                  })
                        : null;

                return NextResponse.json({
                        success: true,
                        message: wasAlreadyCancelled
                                ? "Order was already cancelled"
                                : "Order rejected successfully",
                        order: responseOrder,
                        subOrder,
                });
        } catch (error) {
                console.error("Error rejecting order:", error);
                return NextResponse.json(
			{ success: false, message: "Failed to reject order" },
			{ status: 500 }
		);
	}
}
