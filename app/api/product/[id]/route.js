import Product from "@/model/Product.js";
import Review from "@/model/Review.js";
import companyDetails from "@/model/companyDetails.js";
import { dbConnect } from "@/lib/dbConnect.js";

export async function GET(req, { params }) {
	await dbConnect();

	const { id } = await params;

	try {
                const product = await Product.findById(id).populate({
                        path: "reviews",
                        select: "rating",
                        model: Review,
                });

		if (!product) {
			return Response.json({ message: "Product not found" }, { status: 404 });
		}

		let company = null;
		if (product.sellerId) {
			company = await companyDetails.findOne({ user: product.sellerId });
		}

		const transformedProduct = {
			id: product._id.toString(),
			name: product.title,
			description: product.description,
			longDescription: product.longDescription || product.description,
			price: product.salePrice > 0 ? product.salePrice : product.price,
			originalPrice: product.price,
			discountPercentage: product.discount || 0,
			category: product.category,
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
			rating:
				product.reviews && product.reviews.length > 0
					? Number(
							(
								product.reviews.reduce((acc, r) => acc + r.rating, 0) /
								product.reviews.length
							).toFixed(1)
					  )
					: 0,
			reviews: product.reviews || [],
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
			seller: company
				? {
						companyName: company.name,
						address: company.address,
				  }
				: null,
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
