// import mongoose from "mongoose";

// import { normalizeCouponValue } from "./utils/normalizeCouponValue.js";

// const GstBreakdownSchema = new mongoose.Schema(
// 	{
// 		mode: {
// 			type: String,
// 			enum: ["igst", "cgst_sgst"],
// 			default: "igst",
// 		},
// 		rate: {
// 			type: Number,
// 			default: 18,
// 		},
// 		cgst: {
// 			type: Number,
// 			default: 0,
// 		},
// 		sgst: {
// 			type: Number,
// 			default: 0,
// 		},
// 		igst: {
// 			type: Number,
// 			default: 0,
// 		},
// 		total: {
// 			type: Number,
// 			default: 0,
// 		},
// 		taxableAmount: {
// 			type: Number,
// 			default: 0,
// 		},
// 	},
// 	{ _id: false }
// );

// const CouponAppliedSchema = new mongoose.Schema(
// 	{
// 		couponId: {
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: "Promocode",
// 			default: null,
// 		},
// 		couponCode: {
// 			type: String,
// 			default: null,
// 		},
// 		code: {
// 			type: String,
// 			default: null,
// 		},
// 		name: {
// 			type: String,
// 			default: null,
// 		},
// 		discount: {
// 			type: Number,
// 			default: 0,
// 		},
// 		discountValue: {
// 			type: Number,
// 			default: 0,
// 		},
// 		discountAmount: {
// 			type: Number,
// 			default: 0,
// 		},
// 		discountType: {
// 			type: String,
// 			default: null,
// 		},
// 	},
// 	{ _id: false, strict: false }
// );

// const SubOrderSchema = new mongoose.Schema(
// 	{
// 		orderId: {
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: "Order",
// 			required: true,
// 		},

// 		sellerId: {
// 			type: mongoose.Schema.Types.ObjectId,
// 			ref: "User",
// 			required: true,
// 		},

// 		products: [
// 			{
// 				productId: {
// 					type: mongoose.Schema.Types.ObjectId,
// 					ref: "Product",
// 					required: true,
// 				},
// 				productName: String,
// 				productImage: String,
// 				quantity: { type: Number, required: true },
// 				price: { type: Number, required: true },
// 				totalPrice: { type: Number, required: true },
// 			},
// 		],

// 		// Pricing for this seller
// 		subtotal: Number,
// 		tax: Number,
// 		shippingCost: Number,
// 		discount: Number,
// 		taxableAmount: Number,
// 		totalAmount: Number,
// 		gst: {
// 			type: GstBreakdownSchema,
// 			default: () => ({
// 				mode: "igst",
// 				rate: 18,
// 				cgst: 0,
// 				sgst: 0,
// 				igst: 0,
// 				total: 0,
// 				taxableAmount: 0,
// 			}),
// 		},

// 		// Coupon/Promo applied to this sub-order
// 		couponApplied: {
// 			type: CouponAppliedSchema,
// 			default: null,

// 			set: normalizeCouponValue,
// 		},

// 		// Tracking (per seller)
// 		trackingNumber: String,
// 		courierGroup: String,
// 		estimatedDelivery: Date,
// 		actualDelivery: Date,

// 		// Order status (independent per seller)
// 		status: {
// 			type: String,
// 			enum: [
// 				"pending",
// 				"confirmed",
// 				"processing",
// 				"shipped",
// 				"delivered",
// 				"cancelled",
// 				"returned",
// 			],
// 			default: "pending",
// 		},

// 		orderNotes: String,
// 	},
// 	{ timestamps: true }
// );

// const SubOrderModel = mongoose.models.SubOrder
// 	? mongoose.model("SubOrder", SubOrderSchema, undefined, {
// 			overwriteModels: true,
// 	  })
// 	: mongoose.model("SubOrder", SubOrderSchema);

// export default SubOrderModel;

import mongoose from "mongoose";

import { normalizeCouponValue } from "./utils/normalizeCouponValue.js";

const GstBreakdownSchema = new mongoose.Schema(
	{
		mode: {
			type: String,
			enum: ["igst", "cgst_sgst"],
			default: "igst",
		},
		rate: { type: Number, default: 18 },
		cgst: { type: Number, default: 0 },
		sgst: { type: Number, default: 0 },
		igst: { type: Number, default: 0 },
		total: { type: Number, default: 0 },
		taxableAmount: { type: Number, default: 0 },
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
		couponCode: { type: String, default: null },
		code: { type: String, default: null },
		name: { type: String, default: null },
		discount: { type: Number, default: 0 },
		discountValue: { type: Number, default: 0 },
		discountAmount: { type: Number, default: 0 },
		discountType: { type: String, default: null },
	},
	{ _id: false, strict: false }
);

// 🚀 Enhanced Shipment Package Schema
const ShipmentPackageSchema = new mongoose.Schema(
	{
		// Package dimensions and weight
		packageDetails: {
			length: { type: Number, required: true }, // cm
			width: { type: Number, required: true }, // cm
			height: { type: Number, required: true }, // cm
			actualWeight: { type: Number, required: true }, // g
			volumetricWeight: { type: Number }, // computed
			chargeableWeight: { type: Number }, // max(actual, volumetric)
			boxType: { type: String }, // "S", "M", "L", "XL"
			packageValue: { type: Number }, // declared value for insurance
		},

		// Address information
		pickupAddress: {
			location_type: { type: String, default: "Home" },
			address: String,
			city: String,
			state: String,
			country: { type: String, default: "India" },
			pin: String,
			name: String,
			phone: String,
			street: String,
		},
		deliveryAddress: {
			location_type: { type: String, default: "Office" },
			address: String,
			city: String,
			state: String,
			country: { type: String, default: "India" },
			pin: String,
			name: String,
			phone: String,
			street: String,
		},

                // Hexalog shipment details
                trackingId: String, // Tracking ID from Hexalog
                courierPartner: String, // Selected courier partner
                barcodes: { type: Object }, // Barcodes object from Hexalog

                // Alerting & monitoring
                requiresAttention: { type: Boolean, default: false },
                attentionReason: { type: String, default: null },
                attentionDetails: { type: String, default: null },

                // Shipment status and tracking
                status: {
			type: String,
			enum: [
				"order_placed",
				"label_generated",
				"picked_up",
				"in_transit",
				"out_for_delivery",
				"delivered",
				"failed_delivery",
				"rto",
				"cancelled",
			],
			default: "order_placed",
		},

		// Timestamps
		shipmentCreatedAt: Date,
		labelGeneratedAt: Date,
		pickedUpAt: Date,
		inTransitAt: Date,
		outForDeliveryAt: Date,
		deliveredAt: Date,
		failedDeliveryAt: Date,
		rtoAt: Date,

		// Additional tracking info
		currentLocation: String,
		deliveryAttempts: { type: Number, default: 0 },
		deliveryNotes: String,

		// Return logistics
		isReturn: { type: Boolean, default: false },
		parentShipmentId: { type: String }, // reverse logistics link
		returnReason: String,

		// Cost information
		shippingCost: { type: Number, default: 0 },
		codCharges: { type: Number, default: 0 },
		insuranceCharges: { type: Number, default: 0 },
	},
	{ _id: false }
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
				length: Number, // cm
				width: Number, // cm
				height: Number, // cm
				weight: Number, // g
				size: String, // S, M, L, XL, etc.
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

		// Coupon/Promo
		couponApplied: {
			type: CouponAppliedSchema,
			default: null,
			set: normalizeCouponValue,
		},

		// 🚀 Shipment info (1 SubOrder → 1 ShipmentPackage)
		shipmentPackage: {
			type: ShipmentPackageSchema,
			default: null,
		},

		// Delivery info (high-level tracking)
		estimatedDelivery: Date,
		edd: String, // Estimated Delivery Date as string for quick display
		actualDelivery: Date,
		paymentMethod: { type: String, enum: ["COD", "Prepaid"] },

		// Seller-level order status
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

const SubOrderModel = mongoose.models.SubOrder
	? mongoose.model("SubOrder", SubOrderSchema, undefined, {
			overwriteModels: true,
	  })
	: mongoose.model("SubOrder", SubOrderSchema);

export default SubOrderModel;
