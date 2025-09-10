import Product from "@/model/Product.js";
import Reviews from "@/model/Review.js";

import { dbConnect } from "@/lib/dbConnect.js";
import companyDetails from "@/model/companyDetails";

export async function GET(req, { params }) {
	await dbConnect();

	const { id } = await params;

	console.log("Product ID:", id);

	try {
		// Find product with reviews and user info
		const product = await Product.findById(id).populate({
			path: "reviews",
			model: "Review",
			populate: {
				path: "user",
				model: "User",
				select: "firstName lastName profilePic",
			},
		});

		if (!product) {
			return Response.json({ message: "Product not found" }, { status: 404 });
		}

		const sellerCompany = await companyDetails.findOne(
			{ user: product.sellerId },
			"companyName companyAddress"
		);
		// Get related products from same category
		const relatedProducts = await Product.find({
			category: product.category,
			_id: { $ne: product._id },
			published: true,
		}).limit(4);

		const productSpecifications = {
			brand: product.brand,
			length: product.length,
			width: product.width,
			height: product.height,
			weight: product.weight,
			color: product.colour,
			material: product.material,
			hsnCode: product.hsnCode,
			size: product.size,
		};

		// Transform product data
		const transformedProduct = {
			id: product._id.toString(),
			name: product.title,
			description: product.description,
			longDescription: product.longDescription || product.description,
			price: product.salePrice > 0 ? product.salePrice : product.price,
			originalPrice: product.price,
			discountPercentage: product.discount.toFixed(0) || 0,
			category: product.category,
			subCategory: product.subCategory,
			images: product.images || [],
			image:
				product.images?.[0] ||
				"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
			inStock: product.stocks > 0,
			stocks: product.stocks,
			status: product.stocks > 0 ? "In Stock" : "Out of Stock",
			type: product.type,
			published: product.published,
			features: product.features || [],
			rating: 4.5,
			reviews: product.reviews || [],
			keywords: product.keywords || [],
			specifications: productSpecifications || {},
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
			discountPercentage: p.discount.toFixed(0) || 0,
			image:
				p.images?.[0] ||
				"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
			inStock: p.stocks > 0,
			status: p.stocks > 0 ? "In Stock" : "Out of Stock",
			category: p.category,
			type: p.type,
		}));

		return Response.json({
			success: true,
			product: transformedProduct,
			relatedProducts: transformedRelatedProducts,
			companyDetails: sellerCompany,
		});
	} catch (error) {
		console.error("Product fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch product" },
			{ status: 500 }
		);
	}
}
