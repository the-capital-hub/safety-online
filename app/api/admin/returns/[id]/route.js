import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect";
import Order from "@/model/Order";
import ReturnRequest from "@/model/ReturnRequest";
import SubOrder from "@/model/SubOrder";

const basePopulate = [
        {
                path: "orderId",
                select: "orderNumber orderDate customerName customerEmail customerMobile deliveryAddress status",
        },
        {
                path: "subOrderId",
                populate: {
                        path: "products.productId",
                        select: "title images price",
                },
        },
        {
                path: "userId",
                select: "firstName lastName email mobile",
        },
        {
                path: "sellerId",
                select: "name email businessName",
        },
];

const serializeRequest = (request) => request;

export async function PATCH(request, { params }) {
        try {
                const { id } = await params;

                await dbConnect();

                const payload = await request.json();
                const { status, resolutionNotes, refundAmount } = payload;

                const returnRequest = await ReturnRequest.findById(id);

                if (!returnRequest) {
                        return NextResponse.json(
                                { success: false, message: "Return request not found" },
                                { status: 404 }
                        );
                }

                if (typeof refundAmount !== "undefined") {
                        const parsedRefund = Number(refundAmount);
                        returnRequest.refundAmount = Number.isFinite(parsedRefund) ? parsedRefund : 0;
                }

                if (typeof resolutionNotes === "string") {
                        returnRequest.resolutionNotes = resolutionNotes;
                }

                if (status) {
                        returnRequest.status = status;
                        returnRequest.history.push({
                                status,
                                notes: resolutionNotes || "",
                                changedAt: new Date(),
                                changedBy: "admin",
                        });

                        if (status === "rejected") {
                                if (returnRequest.originalStatus && returnRequest.subOrderId) {
                                        await SubOrder.findByIdAndUpdate(returnRequest.subOrderId, {
                                                status: returnRequest.originalStatus,
                                        });
                                }

                                if (returnRequest.orderOriginalStatus && returnRequest.orderId) {
                                        await Order.findByIdAndUpdate(returnRequest.orderId, {
                                                status: returnRequest.orderOriginalStatus,
                                        });
                                }

                                returnRequest.resolvedAt = new Date();
                        } else if (status === "approved" || status === "processing" || status === "completed") {
                                if (returnRequest.subOrderId) {
                                        await SubOrder.findByIdAndUpdate(returnRequest.subOrderId, {
                                                status: "returned",
                                        });
                                }

                                if (returnRequest.orderId) {
                                        await Order.findByIdAndUpdate(returnRequest.orderId, {
                                                status: "returned",
                                        });
                                }

                                if (status === "completed") {
                                        returnRequest.resolvedAt = new Date();
                                }
                        }
                }

                await returnRequest.save();

                const updatedRequest = await ReturnRequest.findById(id).populate(basePopulate).lean();

                return NextResponse.json({
                        success: true,
                        request: serializeRequest(updatedRequest),
                });
        } catch (error) {
                console.error("Admin return request update error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to update return request" },
                        { status: 500 }
                );
        }
}

export async function GET(request, { params }) {
        try {
                const { id } = await params;

                await dbConnect();

                const returnRequest = await ReturnRequest.findById(id).populate(basePopulate).lean();

                if (!returnRequest) {
                        return NextResponse.json(
                                { success: false, message: "Return request not found" },
                                { status: 404 }
                        );
                }

                return NextResponse.json({ success: true, request: serializeRequest(returnRequest) });
        } catch (error) {
                console.error("Admin return request fetch error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to fetch return request" },
                        { status: 500 }
                );
        }
}
