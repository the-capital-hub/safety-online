import mongoose from "mongoose";

const PaymentHistorySchema = new mongoose.Schema(
        {
                status: {
                        type: String,
                        enum: ["escrow", "released", "refunded", "cancelled", "disputed"],
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

const ManualPayoutHistorySchema = new mongoose.Schema(
        {
                status: {
                        type: String,
                        enum: ["pending", "scheduled", "paid"],
                        default: "pending",
                },
                amount: {
                        type: Number,
                        default: 0,
                },
                reference: {
                        type: String,
                        default: "",
                        trim: true,
                },
                processedAt: {
                        type: Date,
                        default: Date.now,
                },
                processedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        default: null,
                },
                processedByName: {
                        type: String,
                        default: "",
                        trim: true,
                },
                remarks: {
                        type: String,
                        default: "",
                        trim: true,
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
                        enum: ["escrow", "released", "refunded", "cancelled", "disputed"],
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
                payoutReference: {
                        type: String,
                        default: null,
                },
                history: {
                        type: [PaymentHistorySchema],
                        default: [],
                },
                payoutMode: {
                        type: String,
                        enum: ["escrow", "manual"],
                        default: "escrow",
                },
                manualStatus: {
                        type: String,
                        enum: ["pending", "scheduled", "paid"],
                        default: "pending",
                },
                manualPaidAt: {
                        type: Date,
                        default: null,
                },
                manualPayoutReference: {
                        type: String,
                        default: null,
                        trim: true,
                },
                manualNotes: {
                        type: String,
                        default: "",
                        trim: true,
                },
                manualHistory: {
                        type: [ManualPayoutHistorySchema],
                        default: [],
                },
        },
        { timestamps: true }
);

PaymentSchema.index({ sellerId: 1, status: 1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ subOrderId: 1 });
PaymentSchema.index({ orderNumber: 1 });
PaymentSchema.index({ payoutMode: 1, sellerId: 1 });

const PaymentModel =
        mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default PaymentModel;
