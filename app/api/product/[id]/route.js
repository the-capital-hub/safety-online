// app/api/product/[id]/route.js

import Product from "@/model/Product.js";
import { dbConnect } from "@/lib/dbConnect.js";

export async function GET(req, { params }) {
	await dbConnect();

	// Await params to ensure it's resolved
	const { id } = await params;

	console.log("Product ID:", id);

	try {
		const product = await Product.findById(id);

		if (!product) {
			return Response.json({ message: "Product not found" }, { status: 404 });
		}

		// Transform product data to match frontend expectations
		const transformedProduct = {
			id: product._id.toString(),
			name: product.title,
			description: product.description,
			longDescription: product.longDescription || product.description,
			price: product.salePrice > 0 ? product.salePrice : product.price,
			originalPrice: product.price,
			discountPercentage: product.discount || 0,
			category: product.category,
			// gallery: product.images || [],
			image:
				product.images?.[0] ||
				"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
			images: product.images || [],
			inStock: product.stocks > 0,
			stocks: product.stocks,
			status: product.stocks > 0 ? "In Stock" : "Out of Stock",
			type: product.type,
			published: product.published,
			features: product.features || [],
			rating: 4.5,
			reviews: product.reviews || [],
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
		};

		return Response.json({
			success: true,
			product: transformedProduct,
		});
	} catch (error) {
		console.error("Product fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}
