import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import { sendOrderCancellationEmail } from "@/lib/orders/email.js";
import Order from "@/model/Order.js";
import SubOrder from "@/model/SubOrder.js";
import Promocode from "@/model/Promocode";
import { companyInfo } from "@/constants/companyInfo.js";

export async function GET(request, { params }) {
	try {
		await dbConnect();

		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ success: false, message: "Order id is required" },
				{ status: 400 }
			);
		}

                const order = await Order.findById(id)
                        .populate("userId", "firstName lastName email mobile")
                        .populate({
                                path: "subOrders",
                                populate: [
                                        {
                                                path: "products.productId",
                                                select: "name title images price",
                                        },
                                        {
                                                path: "sellerId",
                                                select: "firstName lastName email mobile",
                                        },
                                ],
                        })
                        .populate("couponApplied.couponId", "code discountType discountValue")
                        .lean({ virtuals: true });

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

                const hasShipmentAttention = Array.isArray(order.subOrders)
                        ? order.subOrders.some(
                                  (subOrder) =>
                                          subOrder?.shipmentPackage?.requiresAttention === true
                          )
                        : false;

                return NextResponse.json({
                        success: true,
                        order: { ...order, hasShipmentAttention },
                });
	} catch (error) {
		console.error("Error fetching order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to fetch order" },
			{ status: 500 }
		);
	}
}

export async function PUT(request, { params }) {
	try {
		await dbConnect();

		const updateData = await request.json();

		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ success: false, message: "Order id is required" },
				{ status: 400 }
			);
		}

		const existingOrder = await Order.findById(id)
			.populate("userId", "firstName lastName email")
                        .populate({
                                path: "subOrders",
                                populate: [
                                        {
                                                path: "products.productId",
                                                select: "name title images price",
                                        },
                                        {
                                                path: "sellerId",
                                                select: "firstName lastName email mobile",
                                        },
                                ],
                        });

		if (!existingOrder) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		const shouldCancelOrder = updateData.status === "cancelled";

		if (shouldCancelOrder) {
			await SubOrder.updateMany(
				{ orderId: id, status: { $ne: "cancelled" } },
				{ status: "cancelled" }
			);
		}

                const order = await Order.findByIdAndUpdate(id, updateData, {
                        new: true,
                        runValidators: true,
                })
                        .populate("userId", "firstName lastName email")
                        .populate({
                                path: "subOrders",
                                populate: [
                                        {
                                                path: "products.productId",
                                                select: "name title images price",
                                        },
                                        {
                                                path: "sellerId",
                                                select: "firstName lastName email mobile",
                                        },
                                ],
                        });

                if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		if (shouldCancelOrder && existingOrder.status !== "cancelled") {
			const adminCc = companyInfo.adminEmail
				? [companyInfo.adminEmail]
				: undefined;

			try {
				await sendOrderCancellationEmail({
					order,
					to: order.customerEmail || order.userId?.email,
					cc: adminCc,
					cancelledBy: "admin",
					reason:
						updateData?.adminNotes ||
						updateData?.cancellationReason ||
						undefined,
				});
			} catch (emailError) {
				console.error("Error sending cancellation email:", emailError);
			}
		}

                const orderObject = order.toObject({ virtuals: true });
                const hasShipmentAttention = Array.isArray(orderObject.subOrders)
                        ? orderObject.subOrders.some(
                                  (subOrder) =>
                                          subOrder?.shipmentPackage?.requiresAttention === true
                          )
                        : false;

                return NextResponse.json({
                        success: true,
                        message: "Order updated successfully",
                        order: { ...orderObject, hasShipmentAttention },
                });
	} catch (error) {
		console.error("Error updating order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to update order" },
			{ status: 500 }
		);
	}
}

export async function DELETE(request, { params }) {
	try {
		await dbConnect();

		const { id } = await params;

		if (!id) {
			return NextResponse.json(
				{ success: false, message: "Order id is required" },
				{ status: 400 }
			);
		}

		const order = await Order.findByIdAndDelete(id);

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Order deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting order:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to delete order" },
			{ status: 500 }
		);
	}
}
