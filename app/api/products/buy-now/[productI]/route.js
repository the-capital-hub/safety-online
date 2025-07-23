import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";

export async function POST(request, { params }) {
	await dbConnect();

	try {
		const { productId } = params;
		const { quantity = 1 } = await request.json();

		// Validate product exists and is available
		const product = await Product.findById(productId);

		if (!product) {
			return Response.json(
				{ success: false, message: "Product not found" },
				{ status: 404 }
			);
		}

		if (!product.published) {
			return Response.json(
				{ success: false, message: "Product is not available" },
				{ status: 400 }
			);
		}

		if (!product.inStock || product.stocks < quantity) {
			return Response.json(
				{ success: false, message: "Insufficient stock" },
				{ status: 400 }
			);
		}

		// Create order data for buy now
		const orderData = {
			productId: product._id.toString(),
			productName: product.title,
			quantity: quantity,
			unitPrice: product.salePrice > 0 ? product.salePrice : product.price,
			totalPrice:
				(product.salePrice > 0 ? product.salePrice : product.price) * quantity,
			productImage:
				product.images?.[0] ||
				"/placeholder.svg?height=300&width=300&text=Product",
		};

		return Response.json({
			success: true,
			message: "Proceeding to checkout",
			order: orderData,
			redirectUrl: `/checkout?product=${productId}&quantity=${quantity}`,
		});
	} catch (error) {
		console.error("Buy now error:", error);
		return Response.json(
			{ success: false, message: "Failed to process buy now request" },
			{ status: 500 }
		);
	}
}
