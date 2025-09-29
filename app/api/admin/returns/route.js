import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect";
import ReturnRequest from "@/model/ReturnRequest";

const basePopulate = [
        {
                path: "orderId",
                select: "orderNumber orderDate customerName customerEmail customerMobile deliveryAddress",
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

export async function GET() {
        try {
                await dbConnect();

                const requests = await ReturnRequest.find()
                        .populate(basePopulate)
                        .sort({ createdAt: -1 })
                        .lean();

                return NextResponse.json({ success: true, requests });
        } catch (error) {
                console.error("Admin return requests fetch error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to load return requests" },
                        { status: 500 }
                );
        }
}
