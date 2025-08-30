import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";
import Product from "@/model/Product.js";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF.js";

export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;

		await dbConnect();

		// Populate the productId to get product details
		const order = await Order.findById(resolvedParams.id).populate(
			"products.productId"
		);

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		const orderForPDF = {
			...order.toObject(),
			customerName: order.customerName,
			customerEmail: order.customerEmail,
			customerMobile: order.customerMobile,
			products: order.products.map((product) => ({
				productName: product.productName,
				quantity: product.quantity,
				price: product.price,
				totalPrice: product.totalPrice,
			})),
		};

		console.log("Order for PDF:", orderForPDF);

		const pdfBuffer = await generateInvoicePDF(orderForPDF);

		return new NextResponse(pdfBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="invoice-${order.orderNumber}.pdf"`,
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error("Error generating invoice:", error);
		console.error("Error stack:", error.stack);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to generate invoice",
				error: error.message,
			},
			{ status: 500 }
		);
	}
}
