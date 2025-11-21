import crypto from "crypto";
import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order";
import { createOrderWithSubOrders } from "@/lib/orders/createOrder.js";
import { ensureEscrowPayments } from "@/lib/payments/ensureEscrowPayments.js";
import {
        sendOrderConfirmationEmail,
        sendDonationThankYouEmail,
        sendOrderFailureEmail,
} from "@/lib/orders/email.js";
import { companyInfo } from "@/constants/companyInfo.js";

async function getPopulatedOrder(filter) {
        return Order.findOne(filter).populate({
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
}

export async function POST(req) {
        try {
                await dbConnect();

                const body = await req.json();
                const {
                        razorpay_order_id,
                        razorpay_payment_id,
                        razorpay_signature,
                        orderData,
                        userId,
                        clearCart = false,
                        status = "success",
                        failureReason,
                } = body;

                if (!orderData || !Array.isArray(orderData.products) || orderData.products.length === 0) {
                        return NextResponse.json(
                                { success: false, error: "Order data with products is required" },
                                { status: 400 }
                        );
                }

                if (!userId) {
                        return NextResponse.json(
                                { success: false, error: "User ID is required" },
                                { status: 400 }
                        );
                }

                const adminCc = companyInfo.adminEmail ? [companyInfo.adminEmail] : undefined;

                if (status === "failed") {
                        if (!razorpay_order_id) {
                                return NextResponse.json(
                                        { success: false, error: "Missing Razorpay order id for failure" },
                                        { status: 400 }
                                );
                        }

                        const failureMessage =
                                failureReason || "The payment could not be completed. No amount was captured.";

                        const existingOrder = await getPopulatedOrder({
                                paymentGatewayOrderId: razorpay_order_id,
                        });

                        if (existingOrder) {
                                if (existingOrder.paymentStatus !== "failed") {
                                        existingOrder.paymentStatus = "failed";
                                        existingOrder.status = "cancelled";
                                        existingOrder.paymentFailureReason = failureMessage;
                                        if (razorpay_payment_id) {
                                                existingOrder.transactionId = razorpay_payment_id;
                                        }
                                        await existingOrder.save();
                                }

                                try {
                                        await sendOrderFailureEmail({
                                                order: existingOrder,
                                                to: existingOrder.customerEmail,
                                                cc: adminCc,
                                                failureReason: failureMessage,
                                        });
                                } catch (emailError) {
                                        console.error("Payment failure email error:", emailError);
                                }

                                return NextResponse.json({
                                        success: false,
                                        status: "failed",
                                        message: failureMessage,
                                        orderId: existingOrder._id,
                                        orderNumber: existingOrder.orderNumber,
                                });
                        }

                        const { order, orderId, orderNumber } = await createOrderWithSubOrders({
                                orderData: {
                                        ...orderData,
                                        paymentStatus: "failed",
                                        status: "cancelled",
                                        paymentFailureReason: failureMessage,
                                },
                                userId,
                                clearCart: false,
                                paymentInfo: {
                                        paymentStatus: "failed",
                                        transactionId: razorpay_payment_id || null,
                                        gatewayOrderId: razorpay_order_id,
                                        paymentFailureReason: failureMessage,
                                },
                                orderStatus: "cancelled",
                                subOrderStatus: "cancelled",
                                reserveInventory: false,
                        });

                        try {
                                await sendOrderFailureEmail({
                                        order,
                                        to: order.customerEmail || orderData.customerEmail,
                                        cc: adminCc,
                                        failureReason: failureMessage,
                                });
                        } catch (emailError) {
                                console.error("Payment failure email error:", emailError);
                        }

                        return NextResponse.json({
                                success: false,
                                status: "failed",
                                message: failureMessage,
                                orderId,
                                orderNumber,
                        });
                }

                if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                        return NextResponse.json(
                                { success: false, error: "Incomplete Razorpay payment details" },
                                { status: 400 }
                        );
                }

                if (!process.env.RAZORPAY_KEY_SECRET) {
                        throw new Error("Razorpay key secret is not configured");
                }

                const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
                hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
                const generatedSignature = hmac.digest("hex");

                if (generatedSignature !== razorpay_signature) {
                        return NextResponse.json(
                                { success: false, error: "Invalid payment signature" },
                                { status: 400 }
                        );
                }

                let existingOrder = await getPopulatedOrder({
                        paymentGatewayOrderId: razorpay_order_id,
                });

                if (existingOrder) {
                        if (existingOrder.paymentStatus !== "paid") {
                                existingOrder.paymentStatus = "paid";
                                existingOrder.status = "confirmed";
                                existingOrder.paymentFailureReason = null;
                                existingOrder.transactionId = razorpay_payment_id;
                                await existingOrder.save();
                                existingOrder = await getPopulatedOrder({ _id: existingOrder._id });
                                await ensureEscrowPayments({
                                        order: existingOrder,
                                        paymentInfo: {
                                                transactionId: razorpay_payment_id,
                                                gatewayOrderId: razorpay_order_id,
                                        },
                                });
                        }

                        try {
                                await sendOrderConfirmationEmail({
                                        order: existingOrder,
                                        to: existingOrder.customerEmail,
                                        cc: adminCc,
                                        attachInvoice: true,
                                });
                                await sendDonationThankYouEmail({
                                        order: existingOrder,
                                        to: existingOrder.customerEmail,
                                });
                        } catch (emailError) {
                                console.error("Order confirmation email error:", emailError);
                        }

                        return NextResponse.json({
                                success: true,
                                orderId: existingOrder._id,
                                orderNumber: existingOrder.orderNumber,
                                order: existingOrder,
                        });
                }

                const { order, orderId, orderNumber, subOrderIds } = await createOrderWithSubOrders({
                        orderData: {
                                ...orderData,
                                paymentStatus: "paid",
                                status: "confirmed",
                        },
                        userId,
                        clearCart,
                        paymentInfo: {
                                paymentStatus: "paid",
                                transactionId: razorpay_payment_id,
                                gatewayOrderId: razorpay_order_id,
                        },
                        orderStatus: "confirmed",
                });

                await ensureEscrowPayments({
                        order,
                        paymentInfo: {
                                transactionId: razorpay_payment_id,
                                gatewayOrderId: razorpay_order_id,
                        },
                });

                const orderObject = order.toObject();

                try {
                        await sendOrderConfirmationEmail({
                                order: orderObject,
                                to: orderObject.customerEmail || orderData.customerEmail,
                                cc: adminCc,
                                attachInvoice: true,
                        });
                        await sendDonationThankYouEmail({
                                order: orderObject,
                                to: orderObject.customerEmail || orderData.customerEmail,
                        });
                } catch (emailError) {
                        console.error("Order confirmation email error:", emailError);
                }

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
                console.error("Payment verification error:", error);
                return NextResponse.json(
                        { success: false, error: error.message },
                        { status: 500 }
                );
        }
}
