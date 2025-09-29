import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect";
import Order from "@/model/Order";
import ReturnRequest from "@/model/ReturnRequest";
import ReturnSettings from "@/model/ReturnSettings";
import SubOrder from "@/model/SubOrder";

const buildItemsFromSubOrder = (subOrder) => {
        if (!subOrder || !Array.isArray(subOrder.products)) {
                return [];
        }

        return subOrder.products.map((product) => ({
                productId: product.productId,
                productName: product.productName,
                productImage: product.productImage,
                quantity: product.quantity,
                price: product.price,
                totalPrice: product.totalPrice ?? product.price * product.quantity,
        }));
};

const isWithinWindow = (date, windowDays) => {
        if (!date) return true;
        const now = Date.now();
        const provided = new Date(date).getTime();
        if (Number.isNaN(provided)) return true;
        const diffDays = (now - provided) / (1000 * 60 * 60 * 24);
        return diffDays <= windowDays;
};

export async function POST(request, { params }) {
        try {
                const { id } = await params;
                const payload = await request.json();
                const { subOrderId, reason, description } = payload;

                if (!subOrderId) {
                        return NextResponse.json(
                                { success: false, message: "A sub-order must be selected for return" },
                                { status: 400 }
                        );
                }

                if (!reason) {
                        return NextResponse.json(
                                { success: false, message: "A return reason is required" },
                                { status: 400 }
                        );
                }

                await dbConnect();

                const settings = await ReturnSettings.getOrCreate();

                if (settings.enabled === false) {
                        return NextResponse.json(
                                { success: false, message: "Returns are currently disabled" },
                                { status: 403 }
                        );
                }

                const order = await Order.findById(id).populate({
                        path: "subOrders",
                        populate: {
                                path: "products.productId",
                                select: "title images price",
                        },
                });

                if (!order) {
                        return NextResponse.json(
                                { success: false, message: "Order not found" },
                                { status: 404 }
                        );
                }

                const subOrder = order.subOrders.find(
                        (item) => item._id.toString() === subOrderId.toString()
                );

                if (!subOrder) {
                        return NextResponse.json(
                                { success: false, message: "Sub-order not found" },
                                { status: 404 }
                        );
                }

                const existingRequest = await ReturnRequest.findOne({
                        orderId: order._id,
                        subOrderId: subOrder._id,
                        status: { $in: ["pending", "approved", "processing"] },
                });

                if (existingRequest) {
                        return NextResponse.json(
                                { success: false, message: "A return request already exists for this sub-order" },
                                { status: 409 }
                        );
                }

                const windowDays = Number.isFinite(Number(settings.windowDays))
                        ? Number(settings.windowDays)
                        : 7;

                const deliveredDate =
                        subOrder.actualDelivery || subOrder.updatedAt || order.orderDate || order.createdAt;

                if (!isWithinWindow(deliveredDate, windowDays)) {
                        return NextResponse.json(
                                {
                                        success: false,
                                        message: `The return window of ${windowDays} days has expired for this delivery`,
                                },
                                { status: 400 }
                        );
                }

                const items = buildItemsFromSubOrder(subOrder);
                const refundAmount =
                        subOrder.totalAmount ||
                        items.reduce((total, item) => total + (item.totalPrice || 0), 0);

                const returnRequest = await ReturnRequest.create({
                        orderId: order._id,
                        subOrderId: subOrder._id,
                        userId: order.userId,
                        sellerId: subOrder.sellerId,
                        reason,
                        description: description || "",
                        items,
                        refundAmount,
                        returnWindowDays: windowDays,
                        originalStatus: subOrder.status,
                        orderOriginalStatus: order.status,
                        history: [
                                {
                                        status: "pending",
                                        notes: "Return requested by buyer",
                                        changedAt: new Date(),
                                        changedBy: "buyer",
                                },
                        ],
                });

                await SubOrder.findByIdAndUpdate(subOrder._id, { status: "returned" });
                await Order.findByIdAndUpdate(order._id, { status: "returned" });

                const populatedRequest = await ReturnRequest.findById(returnRequest._id)
                        .populate({
                                path: "orderId",
                                select: "orderNumber orderDate customerName customerEmail customerMobile deliveryAddress",
                        })
                        .populate({
                                path: "subOrderId",
                                populate: { path: "products.productId", select: "title images price" },
                        })
                        .lean();

                return NextResponse.json({ success: true, request: populatedRequest });
        } catch (error) {
                console.error("Create return request error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to submit return request" },
                        { status: 500 }
                );
        }
}
