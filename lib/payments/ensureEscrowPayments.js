import Payment from "@/model/Payment.js";
import User from "@/model/User.js";

function roundCurrency(value) {
        return Math.round((Number(value) || 0) * 100) / 100;
}

async function resolveSellerSnapshot(subOrder) {
        const sellerDoc =
                typeof subOrder.sellerId === "object" && subOrder.sellerId !== null
                        ? subOrder.sellerId
                        : await User.findById(subOrder.sellerId).select(
                                  "firstName lastName email businessName name"
                          );

        if (!sellerDoc) {
                return {
                        name: "",
                        email: "",
                        businessName: "",
                };
        }

        const sellerName =
                sellerDoc.businessName ||
                sellerDoc.name ||
                [sellerDoc.firstName, sellerDoc.lastName].filter(Boolean).join(" ");

        return {
                name: sellerName,
                email: sellerDoc.email || "",
                businessName: sellerDoc.businessName || "",
        };
}

export async function ensureEscrowPayments({
        order,
        commissionRate = 0.1,
        paymentInfo = {},
} = {}) {
        if (!order) return;

        const populatedOrder =
                typeof order.populate === "function"
                        ? await order.populate({
                                  path: "subOrders",
                                  populate: { path: "sellerId" },
                          })
                        : order;

        const subOrders = populatedOrder?.subOrders || [];
        if (!Array.isArray(subOrders) || subOrders.length === 0) {
                return;
        }

        for (const subOrder of subOrders) {
                if (!subOrder?._id || !subOrder?.sellerId) {
                        continue;
                }

                const totalAmount = roundCurrency(subOrder.totalAmount || 0);
                const commissionAmount = roundCurrency(totalAmount * commissionRate);
                const sellerAmount = roundCurrency(totalAmount - commissionAmount);

                const sellerSnapshot = await resolveSellerSnapshot(subOrder);

                const existingPayment = await Payment.findOne({ subOrderId: subOrder._id });

                if (existingPayment) {
                        const updates = {
                                totalAmount,
                                commissionRate,
                                commissionAmount,
                                sellerAmount,
                                orderNumber: order.orderNumber,
                                sellerSnapshot,
                        };

                        if (paymentInfo.gatewayOrderId && !existingPayment.razorpayOrderId) {
                                updates.razorpayOrderId = paymentInfo.gatewayOrderId;
                        }

                        if (paymentInfo.transactionId && !existingPayment.razorpayPaymentId) {
                                updates.razorpayPaymentId = paymentInfo.transactionId;
                        }

                        await Payment.updateOne(
                                { _id: existingPayment._id },
                                {
                                        $set: updates,
                                }
                        );
                        continue;
                }

                const paymentDocument = new Payment({
                        orderId: populatedOrder._id,
                        subOrderId: subOrder._id,
                        orderNumber: populatedOrder.orderNumber,
                        sellerId:
                                typeof subOrder.sellerId === "object"
                                        ? subOrder.sellerId._id
                                        : subOrder.sellerId,
                        sellerSnapshot,
                        totalAmount,
                        commissionRate,
                        commissionAmount,
                        sellerAmount,
                        currency: populatedOrder.currency || "INR",
                        status: "escrow",
                        razorpayOrderId: paymentInfo.gatewayOrderId || populatedOrder.paymentGatewayOrderId || null,
                        razorpayPaymentId: paymentInfo.transactionId || populatedOrder.transactionId || null,
                        escrowActivatedAt: new Date(),
                        history: [
                                {
                                        status: "escrow",
                                        note: "Payment captured and held in escrow",
                                        actorType: "system",
                                        actorId: null,
                                        timestamp: new Date(),
                                },
                        ],
                });

                await paymentDocument.save();
        }
}

export default ensureEscrowPayments;
