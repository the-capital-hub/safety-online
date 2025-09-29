import Payment from "@/model/Payment.js";
import SubOrder from "@/model/SubOrder.js";
import Order from "@/model/Order.js";

function buildHistoryEntry({ status, note, actorType = "system", actorId = null }) {
        return {
                status,
                note: note || "",
                actorType,
                actorId,
                timestamp: new Date(),
        };
}

export async function releaseEscrowPayment({
        paymentId,
        subOrderId,
        actorType = "system",
        actorId = null,
        note,
        force = false,
} = {}) {
        const filter = paymentId ? { _id: paymentId } : { subOrderId };

        const payment = await Payment.findOne(filter)
                .populate({ path: "orderId", select: "paymentStatus" })
                .populate({ path: "subOrderId" });

        if (!payment) {
                throw new Error("Payment record not found");
        }

        if (payment.status === "released") {
                return payment;
        }

        if (!force) {
                if (payment.status !== "escrow") {
                        throw new Error("Payment is not in escrow state");
                }

                if (payment?.orderId?.paymentStatus !== "paid") {
                        throw new Error("Order payment is not marked as paid");
                }

                if (payment?.subOrderId?.status !== "delivered") {
                        throw new Error("Sub-order is not marked as delivered");
                }
        }

        payment.status = "released";
        payment.releasedAt = new Date();
        payment.history.push(
                buildHistoryEntry({
                        status: "released",
                        note: note || "Escrow released to seller",
                        actorType,
                        actorId,
                })
        );

        await payment.save();

        return payment;
}

export async function ensureOrderDeliveryStatus(orderId) {
        if (!orderId) return;

        const undeliveredCount = await SubOrder.countDocuments({
                orderId,
                status: { $ne: "delivered" },
        });

        if (undeliveredCount === 0) {
                await Order.findByIdAndUpdate(orderId, { status: "delivered" });
        }
}

export default releaseEscrowPayment;
