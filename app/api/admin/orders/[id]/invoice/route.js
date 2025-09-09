import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";
import Product from "@/model/Product.js";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF.js";

export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;

		await dbConnect();

		// Populate the subOrders and their products to get complete order details
		const order = await Order.findById(resolvedParams.id).populate({
			path: "subOrders",
			populate: {
				path: "products.productId",
				model: "Product",
				select: "title mainImage price description",
			},
		});

		if (!order) {
			return NextResponse.json(
				{ success: false, message: "Order not found" },
				{ status: 404 }
			);
		}

		// Aggregate all products from all subOrders
		const allProducts = [];
		let totalSubOrderAmount = 0;

		order.subOrders.forEach((subOrder) => {
			subOrder.products.forEach((product) => {
				allProducts.push({
					productId: product.productId._id,
					productName: product.productName || product.productId.title,
					productImage: product.productImage || product.productId.mainImage,
					quantity: product.quantity,
					price: product.price,
					totalPrice: product.totalPrice,
					description: product.productId.description,
				});
			});
			totalSubOrderAmount += subOrder.totalAmount || 0;
		});

		// Create order object for PDF generation
		const orderForPDF = {
			_id: order._id,
			orderNumber: order.orderNumber,
			orderDate: order.orderDate,

			// Customer information
			customerName: order.customerName,
			customerEmail: order.customerEmail,
			customerMobile: order.customerMobile,

			// Delivery address
			deliveryAddress: order.deliveryAddress,

			// Payment information
			paymentMethod: order.paymentMethod,
			paymentStatus: order.paymentStatus,
			transactionId: order.transactionId,

			// Pricing information
			subtotal: order.subtotal,
			tax: order.tax,
			shippingCost: order.shippingCost,
			discount: order.discount,
			totalAmount: order.totalAmount,

			// Coupon information
			couponApplied: order.couponApplied,

			// Order status
			status: order.status,

			// All products from subOrders
			products: allProducts,

			// SubOrder details (if needed for invoice)
			subOrders: order.subOrders.map((subOrder) => ({
				_id: subOrder._id,
				sellerId: subOrder.sellerId,
				status: subOrder.status,
				trackingNumber: subOrder.trackingNumber,
				estimatedDelivery: subOrder.estimatedDelivery,
				actualDelivery: subOrder.actualDelivery,
				subtotal: subOrder.subtotal,
				tax: subOrder.tax,
				shippingCost: subOrder.shippingCost,
				discount: subOrder.discount,
				totalAmount: subOrder.totalAmount,
				products: subOrder.products.map((product) => ({
					productName: product.productName || product.productId.name,
					quantity: product.quantity,
					price: product.price,
					totalPrice: product.totalPrice,
					productImage:
						product.productImage ||
						(product.productId.images && product.productId.images[0]),
				})),
			})),

			// Timestamps
			createdAt: order.createdAt,
			updatedAt: order.updatedAt,
		};

		console.log("Order for PDF:", {
			orderNumber: orderForPDF.orderNumber,
			totalProducts: orderForPDF.products.length,
			totalSubOrders: orderForPDF.subOrders.length,
			totalAmount: orderForPDF.totalAmount,
		});

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
