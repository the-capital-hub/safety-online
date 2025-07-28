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

		// Get related products from same category
		const relatedProducts = await Product.find({
			category: product.category,
			_id: { $ne: product._id },
			published: true,
		}).limit(4);

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
			images: product.images || [],
			gallery: product.images || [],
			image: product.images?.[0] || "/placeholder.svg",
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

		// Transform related products
		const transformedRelatedProducts = relatedProducts.map((p) => ({
			id: p._id.toString(),
			name: p.title,
			description: p.description,
			price: p.salePrice > 0 ? p.salePrice : p.price,
			originalPrice: p.price,
			discountPercentage: p.discount || 0,
			image: p.images?.[0] || "/placeholder.svg",
			inStock: p.stocks > 0,
			status: p.stocks > 0 ? "In Stock" : "Out of Stock",
			category: p.category,
			type: p.type,
		}));

		return Response.json({
			success: true,
			product: transformedProduct,
			relatedProducts: transformedRelatedProducts,
		});
	} catch (error) {
		console.error("Product fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}
