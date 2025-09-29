import mongoose from "mongoose";

const ReturnRequestItemSchema = new mongoose.Schema(
        {
                productId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Product",
                },
                productName: String,
                productImage: String,
                quantity: Number,
                price: Number,
                totalPrice: Number,
        },
        { _id: false }
);

const ReturnRequestHistorySchema = new mongoose.Schema(
        {
                status: {
                        type: String,
                        required: true,
                },
                notes: {
                        type: String,
                        default: "",
                },
                changedAt: {
                        type: Date,
                        default: Date.now,
                },
                changedBy: {
                        type: String,
                        default: "system",
                },
        },
        { _id: false }
);

const ReturnRequestSchema = new mongoose.Schema(
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
                },
                userId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                },
                sellerId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: true,
                },
                status: {
                        type: String,
                        enum: ["pending", "approved", "rejected", "processing", "completed"],
                        default: "pending",
                },
                reason: {
                        type: String,
                        required: true,
                },
                description: {
                        type: String,
                        default: "",
                },
                images: [String],
                refundAmount: {
                        type: Number,
                        default: 0,
                },
                requestedAt: {
                        type: Date,
                        default: Date.now,
                },
                resolvedAt: {
                        type: Date,
                        default: null,
                },
                resolutionNotes: {
                        type: String,
                        default: "",
                },
                returnWindowDays: {
                        type: Number,
                        default: 7,
                },
                originalStatus: {
                        type: String,
                        default: null,
                },
                orderOriginalStatus: {
                        type: String,
                        default: null,
                },
                items: {
                        type: [ReturnRequestItemSchema],
                        default: [],
                },
                history: {
                        type: [ReturnRequestHistorySchema],
                        default: [],
                },
        },
        { timestamps: true }
);

const ReturnRequestModel =
        mongoose.models.ReturnRequest || mongoose.model("ReturnRequest", ReturnRequestSchema);

export default ReturnRequestModel;
