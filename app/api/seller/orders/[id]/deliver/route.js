import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/dbConnect.js";
import SubOrder from "@/model/SubOrder.js";
import { releaseEscrowPayment, ensureOrderDeliveryStatus } from "@/lib/payments/releaseEscrowPayment.js";

export async function PUT(request, { params }) {
        try {
                await dbConnect();

                const token = request.cookies.get("seller-auth-token")?.value;

                if (!token) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const sellerId = decoded.userId;

                const subOrder = await SubOrder.findOne({ _id: params.id, sellerId }).populate(
                        "orderId",
                        "paymentStatus orderNumber"
                );

                if (!subOrder) {
                        return NextResponse.json(
                                { success: false, message: "Order not found or unauthorized" },
                                { status: 404 }
                        );
                }

                if (subOrder.status === "delivered") {
                        let existingPayment = null;
                        try {
                                existingPayment = await releaseEscrowPayment({
                                        subOrderId: subOrder._id,
                                        actorType: "seller",
                                        actorId: sellerId,
                                        note: "Seller re-confirmed delivery",
                                });
                        } catch (error) {
                                // Ignore errors if already released
                        }

                        return NextResponse.json({
                                success: true,
                                message: "Order already marked as delivered",
                                order: subOrder,
                                payment: existingPayment,
                        });
                }

                const deliveryDateInput = await request
                        .json()
                        .catch(() => ({ deliveryDate: new Date().toISOString() }));

                const deliveryDate = deliveryDateInput?.deliveryDate
                        ? new Date(deliveryDateInput.deliveryDate)
                        : new Date();

                subOrder.status = "delivered";
                subOrder.actualDelivery = deliveryDate;

                await subOrder.save();

                let paymentRelease = null;
                let releaseError = null;

                try {
                        paymentRelease = await releaseEscrowPayment({
                                subOrderId: subOrder._id,
                                actorType: "seller",
                                actorId: sellerId,
                                note: "Seller confirmed delivery",
                        });
                } catch (error) {
                        releaseError = error.message;
                }

                await ensureOrderDeliveryStatus(subOrder.orderId?._id);

                return NextResponse.json({
                        success: true,
                        message: "Order marked as delivered",
                        order: subOrder,
                        payment: paymentRelease,
                        releaseError,
                });
        } catch (error) {
                console.error("Error updating delivery status:", error);
                return NextResponse.json(
                        { success: false, message: error.message || "Failed to update delivery status" },
                        { status: 500 }
                );
        }
}
