import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect.js";
import Order from "@/model/Order.js";
import { generateInvoicePDF } from "@/lib/generateInvoicePDF.js";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    await dbConnect();

    const order = await Order.findById(id).populate({
      path: "subOrders",
      populate: {
        path: "products.productId",
        model: "Product",
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    const allProducts = Array.isArray(order.subOrders)
      ? order.subOrders.flatMap((sub) =>
          Array.isArray(sub.products)
            ? sub.products.map((p) => ({
                productName:
                  p.productId?.productName ||
                  p.productId?.name ||
                  p.productId?.title ||
                  "Unknown",
                quantity: p.quantity || 0,
                price: p.price || p.productId?.price || 0,
                totalPrice:
                  (p.price || p.productId?.price || 0) * (p.quantity || 0),
              }))
            : []
        )
      : [];

    const orderForPDF = {
      ...order.toObject(),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerMobile: order.customerMobile,
      products: allProducts,
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
