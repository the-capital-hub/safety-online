import mongoose from "mongoose";

import { normalizeCouponValue } from "./utils/normalizeCouponValue.js";

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

const generateInvoiceNumber = async (orderModel) => {
	const now = new Date();
	const fullYear = now.getFullYear();
	const yearSuffix = fullYear.toString().slice(-2);
	const prefix = `LSI-SO${yearSuffix}-`;
	const startOfYear = new Date(fullYear, 0, 1);
	const startOfNextYear = new Date(fullYear + 1, 0, 1);

	const lastOrder = await orderModel
		.findOne({
			createdAt: { $gte: startOfYear, $lt: startOfNextYear },
			orderNumber: { $regex: `^${prefix}` },
		})
		.sort({ createdAt: -1, _id: -1 })
		.lean();

	let sequence = 1;

	if (lastOrder?.orderNumber) {
		const match = lastOrder.orderNumber.match(/(\d+)$/);

		if (match) {
			sequence = parseInt(match[1], 10) + 1;
		}
	}

	return `${prefix}${sequence.toString().padStart(5, "0")}`;
};

const OrderSchema = new mongoose.Schema(
	{
		orderNumber: {
			type: String,
			unique: true,
			required: true,
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

		// Coupon/Promo
		couponApplied: {
			type: CouponAppliedSchema,
			default: null,

			set: normalizeCouponValue,
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
OrderSchema.pre("validate", async function setInvoiceNumber(next) {
	if (!this.isNew || this.orderNumber) {
		return next();
	}

	try {
		this.orderNumber = await generateInvoiceNumber(this.constructor);
		return next();
	} catch (error) {
		return next(error);
	}
});

OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ customerEmail: 1 });
OrderSchema.index({ paymentGatewayOrderId: 1 });

const OrderModel = mongoose.models.Order
	? mongoose.model("Order", OrderSchema, undefined, { overwriteModels: true })
	: mongoose.model("Order", OrderSchema);

export default OrderModel;
