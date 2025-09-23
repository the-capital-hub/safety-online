import mongoose from "mongoose";

const GstBreakdownSchema = new mongoose.Schema(
        {
                mode: {
                        type: String,
                        enum: ["igst", "cgst_sgst"],
                        default: "igst",
                },
                rate: {
                        type: Number,
                        default: 18,
                },
                cgst: {
                        type: Number,
                        default: 0,
                },
                sgst: {
                        type: Number,
                        default: 0,
                },
                igst: {
                        type: Number,
                        default: 0,
                },
                total: {
                        type: Number,
                        default: 0,
                },
                taxableAmount: {
                        type: Number,
                        default: 0,
                },
        },
        { _id: false }
);

const CouponAppliedSchema = new mongoose.Schema(
        {
                couponId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Promocode",
                        default: null,
                },
                couponCode: {
                        type: String,
                        default: null,
                },
                code: {
                        type: String,
                        default: null,
                },
                name: {
                        type: String,
                        default: null,
                },
                discount: {
                        type: Number,
                        default: 0,
                },
                discountValue: {
                        type: Number,
                        default: 0,
                },
                discountAmount: {
                        type: Number,
                        default: 0,
                },
                discountType: {
                        type: String,
                        default: null,
                },
        },
        { _id: false, strict: false }
);

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
                taxableAmount: Number,
                totalAmount: Number,
                gst: {
                        type: GstBreakdownSchema,
                        default: () => ({
                                mode: "igst",
                                rate: 18,
                                cgst: 0,
                                sgst: 0,
                                igst: 0,
                                total: 0,
                                taxableAmount: 0,
                        }),
                },

                // Coupon/Promo applied to this sub-order
                couponApplied: {
                        type: CouponAppliedSchema,
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
