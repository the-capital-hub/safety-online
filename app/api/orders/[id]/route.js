// app/api/orders/[id]/route.js

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";
import "@/model/SubOrder.js";
import ReturnRequest from "@/model/ReturnRequest.js";

export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		const { searchParams } = new URL(request.url);
		const populate = searchParams.get("populate");

		await dbConnect();

		let query = Order.findById(resolvedParams.id);

		// If populate=products is requested, populate the subOrders with product details
		if (populate === "products") {
			query = query.populate({
				path: "subOrders",
				populate: {
					path: "products.productId",
					model: "Product",
				},
			});
		} else {
			// Default population
			query = query.populate("subOrders");
		}

                const order = await query.lean();

                if (!order) {
                        return NextResponse.json(
                                { success: false, message: "Order not found" },
                                { status: 404 }
                        );
                }

                const returnRequests = await ReturnRequest.find({ orderId: order._id })
                        .sort({ createdAt: -1 })
                        .lean();

                return NextResponse.json(
                        { success: true, order: { ...order, returnRequests } },
                        { status: 200 }
                );
	} catch (error) {
		console.error("Single order fetch error:", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
