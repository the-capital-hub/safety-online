import mongoose from "mongoose";

const PaymentHistorySchema = new mongoose.Schema(
        {
                status: {
                        type: String,
                        enum: [
                                "escrow",
                                "admin_approval",
                                "released",
                                "refunded",
                                "cancelled",
                                "disputed",
                        ],
                        required: true,
                },
                note: { type: String, default: "" },
                actorType: {
                        type: String,
                        enum: ["system", "admin", "seller", "buyer"],
                        default: "system",
                },
                actorId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null,
                },
                timestamp: {
                        type: Date,
                        default: Date.now,
                },
        },
        { _id: false }
);

const PaymentSchema = new mongoose.Schema(
        {
                orderId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Order",
                        required: true,
                },
                subOrderId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "SubOrder",
                        required: true,
                        unique: true,
                },
                orderNumber: {
                        type: String,
                        required: true,
                },
                sellerId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                },
                sellerSnapshot: {
                        name: { type: String, default: "" },
                        email: { type: String, default: "" },
                        businessName: { type: String, default: "" },
                },
                totalAmount: {
                        type: Number,
                        required: true,
                        default: 0,
                },
                commissionRate: {
                        type: Number,
                        default: 0.1,
                },
                commissionAmount: {
                        type: Number,
                        required: true,
                        default: 0,
                },
                sellerAmount: {
                        type: Number,
                        required: true,
                        default: 0,
                },
                status: {
                        type: String,
                        enum: ["escrow", "admin_approval", "released", "refunded", "cancelled", "disputed"],
                        default: "escrow",
                },
                currency: {
                        type: String,
                        default: "INR",
                },
                razorpayOrderId: {
                        type: String,
                        default: null,
                },
                razorpayPaymentId: {
                        type: String,
                        default: null,
                },
                escrowActivatedAt: {
                        type: Date,
                        default: Date.now,
                },
                releasedAt: {
                        type: Date,
                        default: null,
                },
                adminApprovalRequestedAt: {
                        type: Date,
                        default: null,
                },
                adminApprovedAt: {
                        type: Date,
                        default: null,
                },
                adminApprovedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null,
                },
                payoutReference: {
                        type: String,
                        default: null,
                },
                payoutTransactionId: {
                        type: String,
                        default: null,
                },
                payoutMethod: {
                        type: String,
                        default: null,
                },
                history: {
                        type: [PaymentHistorySchema],
                        default: [],
                },
        },
        { timestamps: true }
);

PaymentSchema.index({ sellerId: 1, status: 1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ orderNumber: 1 });

const existingPaymentModel = mongoose.models?.Payment;

if (existingPaymentModel) {
        const statusPath = existingPaymentModel.schema?.path("status");
        const historyStatusPath = existingPaymentModel.schema
                ?.path("history")
                ?.schema?.path("status");

        const statusSupportsAdminApproval = statusPath?.enumValues?.includes(
                "admin_approval"
        );
        const historySupportsAdminApproval =
                historyStatusPath?.enumValues?.includes("admin_approval");

        if (!statusSupportsAdminApproval || !historySupportsAdminApproval) {
                mongoose.deleteModel("Payment");
        }
}

const PaymentModel =
        mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default PaymentModel;
