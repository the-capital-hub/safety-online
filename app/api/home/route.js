import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";

export async function GET(request) {
	await dbConnect();

	try {
		// Get discounted products for showcase section
		const discountedProducts = await Product.find({
			published: true,
			$or: [{ discount: { $gt: 0 } }],
		})
			.limit(6)
			.lean();

		// Get top selling products
		const topSellingProducts = await Product.find({
			published: true,
			type: "top-selling",
		})
			.limit(6)
			.lean();

		// Get best selling product (single product)
		const bestSellingProduct = await Product.findOne({
			published: true,
			type: "best-selling",
		}).lean();

		// Get featured products
		const featuredProducts = await Product.find({
			published: true,
			type: "featured",
		})
			.limit(3)
			.lean();

		// Get all products for category section (with pagination)
		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category") || "all";
		const search = searchParams.get("search") || "";
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "12");

		// Build query for category section
		const categoryQuery = { published: true };

		if (category !== "all" && category !== "All") {
			categoryQuery.category = category;
		}

		if (search) {
			categoryQuery.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ category: { $regex: search, $options: "i" } },
			];
		}

		const skip = (page - 1) * limit;
		const categoryProducts = await Product.find(categoryQuery)
			.skip(skip)
			.limit(limit)
			.lean();

		const totalCategoryProducts = await Product.countDocuments(categoryQuery);

		// Get available categories
		const categories = await Product.distinct("category", { published: true });

		// Transform function
		const transformProduct = (product) => ({
			id: product._id.toString(),
			title: product.title,
			description: product.description,
			longDescription: product.longDescription,
			price: product.salePrice > 0 ? product.salePrice : product.price,
			originalPrice: product.price,
			salePrice: product.salePrice,
			discount: product.discount,
			discountPercentage:
				product.salePrice > 0
					? Math.round(
							((product.price - product.salePrice) / product.price) * 100
					  )
					: product.discount,
			image:
				product.images?.[0] ||
				"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
			images: product.images || [],
			gallery: product.images || [],
			category: product.category,
			inStock: product.inStock && product.stocks > 0,
			stocks: product.stocks,
			status:
				product.inStock && product.stocks > 0 ? "In Stock" : "Out of Stock",
			type: product.type,
			features: product.features || [],
			colors: ["blue", "black", "red", "orange"],
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
		});

		return Response.json({
			success: true,
			data: {
				discountedProducts: discountedProducts.map(transformProduct),
				topSellingProducts: topSellingProducts.map(transformProduct),
				bestSellingProduct: bestSellingProduct
					? transformProduct(bestSellingProduct)
					: null,
				featuredProducts: featuredProducts.map(transformProduct),
				categoryProducts: categoryProducts.map(transformProduct),
				categories: ["All", ...categories],
				pagination: {
					currentPage: page,
					totalPages: Math.ceil(totalCategoryProducts / limit),
					totalProducts: totalCategoryProducts,
					hasNextPage: page < Math.ceil(totalCategoryProducts / limit),
					hasPrevPage: page > 1,
					limit,
				},
			},
		});
	} catch (error) {
		console.error("Home data fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch home data" },
			{ status: 500 }
		);
	}
}
