import mongoose from "mongoose";

import Order from "@/model/Order.js";
import SubOrder from "@/model/SubOrder.js";
import Product from "@/model/Product.js";
import Cart from "@/model/Cart.js";
import User from "@/model/User.js";
import {
	calculateGstTotals,
	determineGstMode,
	GST_RATE_PERCENT,
} from "@/lib/utils/gst.js";
import { createShipmentPackage } from "@/lib/shipping/shipmentUtils.js";

function calculateTotals(
	items,
	{
		discountPercentage = 0,
		gstMode = "igst",
		gstRatePercent = GST_RATE_PERCENT,
	} = {}
) {
	const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
	const discountAmount = (subtotal * discountPercentage) / 100;
	const discountedSubtotal = subtotal - discountAmount;
	const shippingCost = discountedSubtotal >= 500 ? 0 : 50;

	const totals = calculateGstTotals({
		subtotal,
		discount: discountAmount,
		shippingCost,
		gstMode,
		gstRatePercent,
	});

	return {
		subtotal: totals.subtotal,
		discount: totals.discount,
		shippingCost: totals.shippingCost,
		total: totals.total,
		totalAmount: totals.total,
		tax: totals.gst.total,
		gst: totals.gst,
		taxableAmount: totals.taxableAmount,
	};
}

function normalizeNumber(value, fallback = 0) {
	if (value === null || value === undefined || Number.isNaN(Number(value))) {
		return fallback;
	}
	return Number(value);
}

export async function createOrderWithSubOrders({
	orderData,
	userId,
	clearCart = false,
	paymentInfo = {},
	orderStatus,
	subOrderStatus,
	reserveInventory = true,
} = {}) {
	if (
		!orderData ||
		!Array.isArray(orderData.products) ||
		orderData.products.length === 0
	) {
		throw new Error("No products in order");
	}

	if (!userId) {
		throw new Error("User ID is required");
	}

	if (!orderData.paymentMethod) {
		throw new Error("Payment method is required for order creation");
	}

	const session = await mongoose.startSession();

	try {
		await session.startTransaction();

		const effectiveOrderStatus =
			orderStatus ||
			orderData.status ||
			(reserveInventory ? "pending" : "cancelled");
		const effectiveSubOrderStatus =
			subOrderStatus ||
			orderData.subOrderStatus ||
			(reserveInventory ? "pending" : "cancelled");
		const effectivePaymentStatus =
			paymentInfo.paymentStatus ||
			orderData.paymentStatus ||
			(reserveInventory ? "pending" : "failed");

		const paymentFailureReason =
			paymentInfo.paymentFailureReason ||
			orderData.paymentFailureReason ||
			null;

		const subtotalValue = normalizeNumber(orderData.subtotal);
		const discountValue = normalizeNumber(orderData.discount);
		const shippingCostValue = normalizeNumber(orderData.shippingCost);
		const gstRate = orderData?.gst?.rate ?? GST_RATE_PERCENT;
		const gstMode =
			orderData?.gst?.mode || determineGstMode(orderData.deliveryAddress);

		const totals = calculateGstTotals({
			subtotal: subtotalValue,
			discount: discountValue,
			shippingCost: shippingCostValue,
			address: orderData.deliveryAddress,
			gstMode,
			gstRatePercent: gstRate,
		});

                const gstVerifiedAtInput = orderData?.billingInfo?.gstVerifiedAt;
                let gstVerifiedAt = null;
                if (gstVerifiedAtInput) {
                        const parsed = new Date(gstVerifiedAtInput);
                        if (!Number.isNaN(parsed.getTime())) {
                                gstVerifiedAt = parsed;
                        }
                }

                const orderPayload = {
                        orderNumber:
                                orderData.orderNumber ||
                                `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        userId,
			customerName: orderData.customerName,
			customerEmail: orderData.customerEmail,
			customerMobile: orderData.customerMobile,
			subtotal: totals.subtotal,
			tax: totals.gst.total,
			shippingCost: totals.shippingCost,
			discount: totals.discount,
			totalAmount: totals.total,
			gst: totals.gst,
			taxableAmount: totals.taxableAmount,
			couponApplied: orderData.couponApplied || null,
			paymentMethod: orderData.paymentMethod,
			paymentStatus: effectivePaymentStatus,
			transactionId:
				paymentInfo.transactionId || orderData.transactionId || null,
			paymentGatewayOrderId:
				paymentInfo.gatewayOrderId || orderData.paymentGatewayOrderId || null,
			paymentFailureReason,
                        deliveryAddress: orderData.deliveryAddress,
                        billingInfo: {
                                gstInvoiceRequested: Boolean(
                                        orderData?.billingInfo?.gstInvoiceRequested
                                ),
                                gstNumber: orderData?.billingInfo?.gstNumber || null,
                                gstLegalName: orderData?.billingInfo?.gstLegalName || null,
                                gstTradeName: orderData?.billingInfo?.gstTradeName || null,
                                gstState: orderData?.billingInfo?.gstState || null,
                                gstAddress: orderData?.billingInfo?.gstAddress || null,
                                gstVerifiedAt,
                        },
                        status: effectiveOrderStatus,
                        subOrders: [],
                };

		const [order] = await Order.create([orderPayload], { session });

		const productsBySeller = new Map();
		const stockUpdates = [];

		for (const item of orderData.products) {
			const product = await Product.findById(item.productId)
				.select(
					"sellerId stocks title price images length width height weight size"
				)
				.session(session);

			if (!product) {
				if (reserveInventory) {
					throw new Error(`Product not found: ${item.productId}`);
				}
			} else if (reserveInventory) {
				if (product.stocks < item.quantity) {
					throw new Error(
						`Insufficient stock for product: ${product.title}. Available: ${product.stocks}, Requested: ${item.quantity}`
					);
				}

				stockUpdates.push({
					productId: item.productId,
					quantityToDeduct: item.quantity,
				});
			}

			const sellerId =
				product?.sellerId?.toString() || item.sellerId?.toString() || null;

			if (!sellerId) {
				throw new Error(
					`Seller information missing for product: ${item.productId}`
				);
			}

			const existingItems = productsBySeller.get(sellerId) || [];
			existingItems.push({
				...item,
				sellerId: product?.sellerId || item.sellerId,
				productName: item.productName || product?.title || "Unknown Product",
				productImage:
					item.productImage || item.image || product?.images?.[0] || "",
				price: normalizeNumber(item.price ?? product?.price),
				totalPrice: normalizeNumber(
					item.totalPrice ??
						(item.quantity || 0) * normalizeNumber(item.price ?? product?.price)
				),
				length: product?.length || null,
				width: product?.width || null,
				height: product?.height || null,
				weight: product?.weight || null,
				size: product?.size || null,
			});
			productsBySeller.set(sellerId, existingItems);
		}

		if (reserveInventory && stockUpdates.length > 0) {
			const bulkOps = stockUpdates.map((update) => ({
				updateOne: {
					filter: { _id: update.productId },
					update: { $inc: { stocks: -update.quantityToDeduct } },
				},
			}));

			await Product.bulkWrite(bulkOps, { session });
		}

		const subOrderPayloads = [];

		for (const [sellerKey, items] of productsBySeller.entries()) {
			const totals = calculateTotals(items, {
				gstMode,
				gstRatePercent: gstRate,
			});

			const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerKey)
				? new mongoose.Types.ObjectId(sellerKey)
				: items[0]?.sellerId || undefined;

			// Create subOrder payload
			const subOrderPayload = {
				orderId: order._id,
				sellerId: sellerObjectId,
				products: items.map((item) => ({
					productId: item.productId,
					productName: item.productName,
					productImage: item.productImage || "",
					quantity: item.quantity,
					price: normalizeNumber(item.price),
					totalPrice: normalizeNumber(item.totalPrice),
					length: item.length || null,
					width: item.width || null,
					height: item.height || null,
					weight: item.weight || null,
					size: item.size || null,
				})),
				subtotal: totals.subtotal,
				tax: totals.tax,
				shippingCost: totals.shippingCost,
				discount: totals.discount,
				totalAmount: totals.total,
				gst: totals.gst,
				taxableAmount: totals.taxableAmount,
				couponApplied: orderData.couponApplied || null,
				status: effectiveSubOrderStatus,
				paymentMethod: orderData.paymentMethod === "cod" ? "COD" : "Prepaid",
			};

			subOrderPayloads.push(subOrderPayload);
		}

		const createdSubOrders = subOrderPayloads.length
			? await SubOrder.create(subOrderPayloads, { session })
			: [];

		const subOrderIds = createdSubOrders.map((subOrder) => subOrder._id);

		// Create shipment packages for each subOrder
		if (createdSubOrders.length > 0 && reserveInventory) {
			console.log(
				`🚀 Creating shipment packages for ${createdSubOrders.length} subOrders`
			);

			for (const subOrder of createdSubOrders) {
				try {
					// Create shipment package
					const shipmentPackage = await createShipmentPackage(
						subOrder,
						orderData.deliveryAddress,
						orderData.customerMobile
					);

					// Update subOrder with shipment package
					await SubOrder.findByIdAndUpdate(
						subOrder._id,
						{ $set: { shipmentPackage } },
						{ session }
					);

					console.log(
						`✅ Shipment package created for SubOrder ${subOrder._id}`
					);
				} catch (shipmentError) {
					console.error(
						`❌ Failed to create shipment package for SubOrder ${subOrder._id}:`,
						shipmentError
					);
					// Continue with other subOrders even if one fails
				}
			}
		}

		if (subOrderIds.length > 0) {
			await Order.findByIdAndUpdate(
				order._id,
				{ $set: { subOrders: subOrderIds } },
				{ session, new: true }
			);
		}

		if (clearCart && userId) {
			await Cart.findOneAndUpdate(
				{ user: userId },
				{ products: [], totalPrice: 0, appliedPromo: null },
				{ session }
			);
		}

		await session.commitTransaction();

		const finalOrder = await Order.findById(order._id).populate({
			path: "subOrders",
			populate: [
				{
					path: "products.productId",
					select: "title images price category",
				},
				{
					path: "sellerId",
					select: "name email businessName",
				},
			],
		});

		return {
			order: finalOrder,
			orderId: finalOrder._id,
			orderNumber: finalOrder.orderNumber,
			subOrderIds,
		};
	} catch (error) {
		await session.abortTransaction();
		throw error;
	} finally {
		await session.endSession();
	}
}

export default createOrderWithSubOrders;
