// app/api/orders/[id]/route.js

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";

export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		await dbConnect();

		const order = await Order.findById(resolvedParams.id)
			.populate("subOrders")
			.lean();

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ success: true, order }, { status: 200 });
	} catch (error) {
		console.error("Single order fetch error:", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 }
		);
	}
}
