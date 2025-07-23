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

		// For now, we'll return success with product details
		// In a real app, you'd add this to user's cart in database
		const productData = {
			id: product._id.toString(),
			name: product.title,
			description: product.description,
			price: product.salePrice > 0 ? product.salePrice : product.price,
			originalPrice: product.price,
			image:
				product.images?.[0] ||
				"/placeholder.svg?height=300&width=300&text=Product",
			quantity: quantity,
			inStock: product.inStock,
			availableStock: product.stocks,
		};

		return Response.json({
			success: true,
			message: "Product added to cart successfully",
			product: productData,
		});
	} catch (error) {
		console.error("Add to cart error:", error);
		return Response.json(
			{ success: false, message: "Failed to add product to cart" },
			{ status: 500 }
		);
	}
}
