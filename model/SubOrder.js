import mongoose from "mongoose";

const SubOrderSchema = new mongoose.Schema(
	{
		orderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
			required: true,
		},

		sellerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},

		products: [
			{
				productId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				productName: String,
				productImage: String,
				quantity: { type: Number, required: true },
				price: { type: Number, required: true },
				totalPrice: { type: Number, required: true },
			},
		],

		// Pricing for this seller
		subtotal: Number,
		tax: Number,
		shippingCost: Number,
		discount: Number,
		totalAmount: Number,

		// Coupon/Promo applied to this sub-order
		couponApplied: {
			type: String,
			default: null,
		},

		// Tracking (per seller)
		trackingNumber: String,
		estimatedDelivery: Date,
		actualDelivery: Date,

		// Order status (independent per seller)
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

		orderNotes: String,
	},
	{ timestamps: true }
);

export default mongoose.models.SubOrder ||
	mongoose.model("SubOrder", SubOrderSchema);
