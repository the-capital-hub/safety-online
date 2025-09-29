import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbConnect";
import ReturnRequest from "@/model/ReturnRequest";

const formatAddress = (address) => {
        if (!address) return "";
        const parts = [
                address.street,
                address.city,
                address.state,
                address.zipCode,
                address.country,
        ].filter(Boolean);
        return parts.join(", ");
};

const basePopulate = [
        {
                path: "orderId",
                select: "orderNumber orderDate deliveryAddress customerName customerEmail customerMobile",
        },
        {
                path: "subOrderId",
                populate: {
                        path: "products.productId",
                        select: "title images price",
                },
        },
];

const mapProducts = (request) => {
        if (Array.isArray(request.items) && request.items.length > 0) {
                return request.items.map((item) => ({
                        id: item.productId?.toString() || undefined,
                        name: item.productName,
                        image: item.productImage,
                        quantity: item.quantity,
                        price: item.price,
                        totalPrice: item.totalPrice,
                }));
        }

        const subOrderProducts = request.subOrderId?.products || [];

        return subOrderProducts.map((product) => ({
                id: product.productId?._id?.toString() || product.productId?.toString(),
                name:
                        product.productName ||
                        product.productId?.title ||
                        product.productId?.name ||
                        "Product",
                image: product.productImage || product.productId?.images?.[0] || null,
                quantity: product.quantity,
                price: product.price,
                totalPrice: product.totalPrice ?? product.price * product.quantity,
        }));
};

export async function GET() {
        try {
                await dbConnect();

                const cookieStore = cookies();
                const token = cookieStore.get("seller-auth-token")?.value;

                if (!token) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                if (!process.env.JWT_SECRET) {
                        return NextResponse.json(
                                { success: false, message: "Server configuration error" },
                                { status: 500 }
                        );
                }

                let decoded;
                try {
                        decoded = jwt.verify(token, process.env.JWT_SECRET);
                } catch (error) {
                        return NextResponse.json(
                                { success: false, message: "Invalid token" },
                                { status: 401 }
                        );
                }

                const sellerId = decoded.userId || decoded.id;
                if (!sellerId) {
                        return NextResponse.json(
                                { success: false, message: "Invalid token payload" },
                                { status: 401 }
                        );
                }

                const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

                const requests = await ReturnRequest.find({ sellerId: sellerObjectId })
                        .populate(basePopulate)
                        .sort({ createdAt: -1 })
                        .lean();

                const orders = requests.map((request) => {
                        const subOrder = request.subOrderId || {};
                        const order = request.orderId || {};
                        const products = mapProducts(request);
        const totalQuantity = products.reduce(
                (sum, item) => sum + (Number(item.quantity) || 0),
                0
        );
        const windowDays = Number.isFinite(Number(request.returnWindowDays))
                ? Number(request.returnWindowDays)
                : 7;
        const baseDate = request.requestedAt || request.createdAt || request.updatedAt;
        const refundDeadline = baseDate
                ? new Date(new Date(baseDate).getTime() + windowDays * 24 * 60 * 60 * 1000)
                : null;

                return {
                        id: request._id.toString(),
                        requestId: request._id.toString(),
                                orderNumber: order.orderNumber || "N/A",
                                subOrderCode: `${order.orderNumber || "SUB"}-${(subOrder._id || "")
                                        .toString()
                                        .slice(-4)}`,
                                orderDate: order.orderDate,
                                status: request.status,
                                returnStatus: request.status,
                                totalAmount: Number(subOrder.totalAmount || request.refundAmount || 0),
                                subtotal: Number(subOrder.subtotal || 0),
                                discount: Number(subOrder.discount || 0),
                                shippingCost: Number(subOrder.shippingCost || 0),
                                totalQuantity,
                                refundDeadline,
                                updatedAt: request.updatedAt,
                                requestedAt: request.requestedAt || request.createdAt,
                                products,
                                deliveryAddress: order.deliveryAddress,
                                location: formatAddress(order.deliveryAddress),
                                customer: {
                                        name: order.customerName || order.customerEmail || "Customer",
                                        email: order.customerEmail,
                                        mobile: order.customerMobile,
                                },
                        refundAmount: request.refundAmount,
                        reason: request.reason,
                        resolutionNotes: request.resolutionNotes,
                        returnWindowDays: windowDays,
                };
                });

                return NextResponse.json({ success: true, orders });
        } catch (error) {
                console.error("Seller return orders error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to fetch return orders" },
                        { status: 500 }
                );
        }
}
