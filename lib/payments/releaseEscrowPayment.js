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

        if (payment.status === "released" || payment.status === "admin_approval") {
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

        payment.status = "admin_approval";
        payment.adminApprovalRequestedAt = new Date();
        payment.history.push(
                buildHistoryEntry({
                        status: "admin_approval",
                        note: note || "Seller delivery confirmed. Awaiting admin approval.",
                        actorType,
                        actorId,
                })
        );

        await payment.save();

        return payment;
}

export async function approveEscrowPayment({
        paymentId,
        actorId,
        note,
        transactionId,
        paymentMethod,
} = {}) {
        if (!paymentId) {
                throw new Error("Payment ID is required for approval");
        }

        const payment = await Payment.findById(paymentId);

        if (!payment) {
                throw new Error("Payment record not found");
        }

        if (payment.status === "released") {
                return payment;
        }

        if (payment.status !== "admin_approval") {
                throw new Error("Payment is not awaiting admin approval");
        }

        if (!transactionId || !transactionId.trim()) {
                throw new Error("Transaction ID is required");
        }

        if (!paymentMethod || !paymentMethod.trim()) {
                throw new Error("Payment method is required");
        }

        const trimmedTransactionId = transactionId.trim();
        const trimmedMethod = paymentMethod.trim();

        payment.status = "released";
        payment.releasedAt = new Date();
        payment.adminApprovedAt = new Date();
        payment.adminApprovedBy = actorId || null;
        payment.payoutTransactionId = trimmedTransactionId;
        payment.payoutReference = trimmedTransactionId;
        payment.payoutMethod = trimmedMethod;

        payment.history.push(
                buildHistoryEntry({
                        status: "released",
                        note:
                                note ||
                                `Admin approved payout via ${trimmedMethod} (Txn: ${trimmedTransactionId})`,
                        actorType: "admin",
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
