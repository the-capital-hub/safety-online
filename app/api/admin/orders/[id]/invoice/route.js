import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF.js";

export async function GET(request, { params }) {
	try {
		await dbConnect();

		const order = await Order.findById(params.id)
			.populate("userId", "firstName lastName email mobile")
			.populate("products.productId", "name images price")
			.populate("couponApplied.couponId", "code discountType discountValue");

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		const pdfBuffer = await generateInvoicePDF(order);

		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
			},
		});
	} catch (error) {
		console.error("Error generating invoice:", error);
		return NextResponse.json(
			{ success: false, message: "Failed to generate invoice" },
			{ status: 500 }
		);
	}
}
