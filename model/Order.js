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

		// Customer Information
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		customerName: {
			type: String,
			required: true,
		},
		customerEmail: {
			type: String,
			required: true,
		},
		customerMobile: {
			type: String,
			required: true,
		},

		// Order Details
		products: [
			{
				productId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				productName: String,
				productImage: String,
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
				},
				totalPrice: {
					type: Number,
					required: true,
				},
			},
		],

		// Pricing
		subtotal: {
			type: Number,
			required: true,
		},
		tax: {
			type: Number,
			default: 0,
		},
		shippingCost: {
			type: Number,
			default: 0,
		},
		discount: {
			type: Number,
			default: 0,
		},
		totalAmount: {
			type: Number,
			required: true,
		},

		// Payment Information
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

		// Order Status
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

		// Delivery Information
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

		// Coupon Information
		couponApplied: {
			couponId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Coupon",
			},
			couponCode: String,
			discountAmount: Number,
			discountType: String,
		},

		// Tracking
		trackingNumber: String,
		estimatedDelivery: Date,
		actualDelivery: Date,

		// Notes
		orderNotes: String,
		adminNotes: String,

		// Timestamps
		orderDate: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes for better query performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ customerEmail: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
