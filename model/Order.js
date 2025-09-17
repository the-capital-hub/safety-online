import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
	{
		orderNumber: {
			type: String,
			unique: true,
			required: true,
			default: () =>
				`ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		},

		// Customer
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		customerName: String,
		customerEmail: String,
		customerMobile: String,

		// Pricing (combined totals)
		subtotal: Number,
		tax: Number,
		shippingCost: Number,
		discount: Number,
		totalAmount: Number,

		// Coupon/Promo
		couponApplied: {
			type: String,
			default: null,
		},

		// Payment
		paymentMethod: {
			type: String,
			enum: [
				"cod",
				"razorpay",
				"credit_card",
				"debit_card",
				"net_banking",
				"upi",
				"wallet",
			],
			required: true,
		},
                paymentStatus: {
                        type: String,
                        enum: ["pending", "paid", "failed", "refunded"],
                        default: "pending",
                },
                transactionId: String,
                paymentGatewayOrderId: {
                        type: String,
                        default: null,
                },
                paymentFailureReason: {
                        type: String,
                        default: null,
                },

		// Delivery Info (shared if same address)
		deliveryAddress: {
			street: String,
			city: String,
			state: String,
			zipCode: String,
			country: String,
			fullAddress: String,
			name: String,
			tag: String,
		},

		// Sub-orders reference
		subOrders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "SubOrder",
			},
		],

		// Tracking buyer-level
		status: {
			type: String,
			enum: [
				"pending",
				"confirmed",
				"processing",
				"shipped",
				"delivered",
				"cancelled",
				"returned",
			],
			default: "pending",
		},

		orderDate: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

// Indexes for better query performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ paymentGatewayOrderId: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
