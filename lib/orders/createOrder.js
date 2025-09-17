import mongoose from "mongoose";

import Order from "@/model/Order.js";
import SubOrder from "@/model/SubOrder.js";
import Product from "@/model/Product.js";
import Cart from "@/model/Cart.js";

function calculateTotals(items, discountPercentage = 0) {
        const subtotal = items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const discount = (subtotal * discountPercentage) / 100;
        const discountedSubtotal = subtotal - discount;
        const tax = discountedSubtotal * 0.18;
        const shippingCost = discountedSubtotal >= 500 ? 0 : 50;
        const totalAmount = discountedSubtotal + tax + shippingCost;

        return {
                subtotal,
                tax: Math.round(tax * 100) / 100,
                shippingCost,
                discount: Math.round(discount * 100) / 100,
                totalAmount: Math.round(totalAmount * 100) / 100,
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
        if (!orderData || !Array.isArray(orderData.products) || orderData.products.length === 0) {
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
                        orderStatus || orderData.status || (reserveInventory ? "pending" : "cancelled");
                const effectiveSubOrderStatus =
                        subOrderStatus || orderData.subOrderStatus || (reserveInventory ? "pending" : "cancelled");
                const effectivePaymentStatus =
                        paymentInfo.paymentStatus ||
                        orderData.paymentStatus ||
                        (reserveInventory ? "pending" : "failed");

                const paymentFailureReason =
                        paymentInfo.paymentFailureReason || orderData.paymentFailureReason || null;

                const orderPayload = {
                        orderNumber:
                                orderData.orderNumber ||
                                `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        userId,
                        customerName: orderData.customerName,
                        customerEmail: orderData.customerEmail,
                        customerMobile: orderData.customerMobile,
                        subtotal: normalizeNumber(orderData.subtotal),
                        tax: normalizeNumber(orderData.tax),
                        shippingCost: normalizeNumber(orderData.shippingCost),
                        discount: normalizeNumber(orderData.discount),
                        totalAmount: normalizeNumber(orderData.totalAmount),
                        couponApplied: orderData.couponApplied || null,
                        paymentMethod: orderData.paymentMethod,
                        paymentStatus: effectivePaymentStatus,
                        transactionId: paymentInfo.transactionId || orderData.transactionId || null,
                        paymentGatewayOrderId:
                                paymentInfo.gatewayOrderId || orderData.paymentGatewayOrderId || null,
                        paymentFailureReason,
                        deliveryAddress: orderData.deliveryAddress,
                        status: effectiveOrderStatus,
                        subOrders: [],
                };

                const [order] = await Order.create([orderPayload], { session });

                const productsBySeller = new Map();
                const stockUpdates = [];

                for (const item of orderData.products) {
                        const product = await Product.findById(item.productId)
                                .select("sellerId stocks title price images")
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
                                throw new Error(`Seller information missing for product: ${item.productId}`);
                        }

                        const existingItems = productsBySeller.get(sellerId) || [];
                        existingItems.push({
                                ...item,
                                sellerId: product?.sellerId || item.sellerId,
                                productName: item.productName || product?.title || "Unknown Product",
                                productImage: item.productImage || item.image || product?.images?.[0] || "",
                                price: normalizeNumber(item.price ?? product?.price),
                                totalPrice: normalizeNumber(
                                        item.totalPrice ??
                                                (item.quantity || 0) * normalizeNumber(item.price ?? product?.price)
                                ),
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
                        const totals = calculateTotals(items);

                        const sellerObjectId = mongoose.Types.ObjectId.isValid(sellerKey)
                                ? new mongoose.Types.ObjectId(sellerKey)
                                : items[0]?.sellerId || undefined;

                        subOrderPayloads.push({
                                orderId: order._id,
                                sellerId: sellerObjectId,
                                products: items.map((item) => ({
                                        productId: item.productId,
                                        productName: item.productName,
                                        productImage: item.productImage || "",
                                        quantity: item.quantity,
                                        price: normalizeNumber(item.price),
                                        totalPrice: normalizeNumber(item.totalPrice),
                                })),
                                subtotal: totals.subtotal,
                                tax: totals.tax,
                                shippingCost: totals.shippingCost,
                                discount: totals.discount,
                                totalAmount: totals.totalAmount,
                                couponApplied: orderData.couponApplied || null,
                                status: effectiveSubOrderStatus,
                        });
                }

                const createdSubOrders = subOrderPayloads.length
                        ? await SubOrder.create(subOrderPayloads, { session })
                        : [];

                const subOrderIds = createdSubOrders.map((subOrder) => subOrder._id);

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
