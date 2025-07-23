import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";

export async function GET(req, { params }) {
	await dbConnect();

	try {
		const product = await Product.findById(params.id).populate({
			path: "reviews",
			populate: {
				path: "user",
				select: "firstName lastName",
			},
		});

		if (!product) {
			return Response.json({ message: "Product not found" }, { status: 404 });
		}

		// Get related products from same category
		const relatedProducts = await Product.find({
			category: product.category,
			_id: { $ne: product._id },
			published: true,
		}).limit(4);

		return Response.json({
			product,
			relatedProducts,
		});
	} catch (error) {
		console.error("Product fetch error:", error);
		return Response.json(
			{ message: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}
