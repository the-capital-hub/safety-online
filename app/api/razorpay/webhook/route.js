import crypto from "crypto";
import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";
import {
        sendOrderConfirmationEmail,
        sendOrderFailureEmail,
} from "@/lib/orders/email.js";
import { companyInfo } from "@/constants/companyInfo.js";

async function updateOrderAndNotify(order, update, notification) {
        const adminCc = companyInfo.adminEmail ? [companyInfo.adminEmail] : undefined;
        const updatedOrder = await Order.findByIdAndUpdate(order._id, update, {
                new: true,
        }).populate({
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
        });

        if (!updatedOrder) {
                return null;
        }

        try {
                if (notification?.type === "success") {
                        await sendOrderConfirmationEmail({
                                order: updatedOrder,
                                to: updatedOrder.customerEmail,
                                cc: adminCc,
                                attachInvoice: true,
                        });
                } else if (notification?.type === "failure") {
                        await sendOrderFailureEmail({
                                order: updatedOrder,
                                to: updatedOrder.customerEmail,
                                cc: adminCc,
                                failureReason: notification?.reason,
                        });
                }
        } catch (emailError) {
                console.error("Webhook notification email error:", emailError);
        }

        return updatedOrder;
}

export async function POST(req) {
        try {
                const rawBody = await req.text();

                const signature = req.headers.get("x-razorpay-signature");
                if (!signature) {
                        return NextResponse.json(
                                { success: false, error: "Missing webhook signature" },
                                { status: 400 }
                        );
                }

                const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
                if (!webhookSecret) {
                        console.error("Razorpay webhook secret is not configured");
                        return NextResponse.json(
                                { success: false, error: "Webhook secret not configured" },
                                { status: 500 }
                        );
                }

                const expectedSignature = crypto
                        .createHmac("sha256", webhookSecret)
                        .update(rawBody)
                        .digest("hex");

                if (expectedSignature !== signature) {
                        return NextResponse.json(
                                { success: false, error: "Invalid webhook signature" },
                                { status: 400 }
                        );
                }

                const payload = JSON.parse(rawBody);

                await dbConnect();

                const event = payload?.event;

                if (!event) {
                        return NextResponse.json({ success: false, error: "Missing event type" }, { status: 400 });
                }

                if (event === "payment.captured" || event === "order.paid") {
                        const paymentEntity = payload?.payload?.payment?.entity;
                        const orderEntity = payload?.payload?.order?.entity;

                        const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
                        const paymentId = paymentEntity?.id;

                        if (!razorpayOrderId) {
                                return NextResponse.json({
                                        success: true,
                                        message: "No Razorpay order id in webhook",
                                });
                        }

                        const order = await Order.findOne({ paymentGatewayOrderId: razorpayOrderId });

                        if (!order) {
                                console.warn("Webhook: order not found for", razorpayOrderId);
                                return NextResponse.json({ success: true, message: "Order not found" });
                        }

                        if (order.paymentStatus === "paid") {
                                return NextResponse.json({ success: true, message: "Order already marked paid" });
                        }

                        await updateOrderAndNotify(
                                order,
                                {
                                        paymentStatus: "paid",
                                        status: order.status === "pending" ? "confirmed" : order.status,
                                        transactionId: paymentId || order.transactionId,
                                        paymentFailureReason: null,
                                },
                                { type: "success" }
                        );

                        return NextResponse.json({ success: true });
                }

                if (event === "payment.failed") {
                        const paymentEntity = payload?.payload?.payment?.entity;
                        const razorpayOrderId = paymentEntity?.order_id;
                        const failureReason =
                                paymentEntity?.error_description ||
                                paymentEntity?.description ||
                                paymentEntity?.error_reason ||
                                "Payment failed";

                        if (!razorpayOrderId) {
                                return NextResponse.json({ success: true, message: "No order id for failure" });
                        }

                        const order = await Order.findOne({ paymentGatewayOrderId: razorpayOrderId });

                        if (!order) {
                                console.warn("Webhook: failure for unknown order", razorpayOrderId);
                                return NextResponse.json({ success: true, message: "Order not found" });
                        }

                        if (order.paymentStatus === "failed") {
                                return NextResponse.json({ success: true, message: "Order already marked failed" });
                        }

                        await updateOrderAndNotify(
                                order,
                                {
                                        paymentStatus: "failed",
                                        status: "cancelled",
                                        paymentFailureReason: failureReason,
                                },
                                { type: "failure", reason: failureReason }
                        );

                        return NextResponse.json({ success: true });
                }

                return NextResponse.json({ success: true, message: `Unhandled event ${event}` });
        } catch (error) {
                console.error("Razorpay webhook error:", error);
                return NextResponse.json(
                        { success: false, error: error.message },
                        { status: 500 }
                );
        }
}

export const dynamic = "force-dynamic";
