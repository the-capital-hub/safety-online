// app/api/products/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";
import Reviews from "@/model/Review.js";

export async function GET(request) {
	await dbConnect();

	try {
		const { searchParams } = new URL(request.url);

		// Extract query parameters
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");
		const inStock = searchParams.get("inStock");
		const discount = searchParams.get("discount");
		const category = searchParams.get("category");
		const search = searchParams.get("search");
		const type = searchParams.get("type");
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "12");
		const sort = searchParams.get("sort") || "createdAt";
		const order = searchParams.get("order") || "desc";

		// Build query
		const query = { published: true };

		// Category filter
		if (category && category !== "all") {
			query.category = category;
		}

		// Search filter
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ longDescription: { $regex: search, $options: "i" } },
			];
		}

		// Price range filter
		if (minPrice || maxPrice) {
			query.$and = query.$and || [];
			const priceQuery = {};

			if (minPrice) {
				priceQuery.$gte = Number.parseInt(minPrice);
			}
			if (maxPrice) {
				priceQuery.$lte = Number.parseInt(maxPrice);
			}

			// Check both regular price and sale price
			query.$and.push({
				$or: [{ price: priceQuery }, { salePrice: { ...priceQuery, $gt: 0 } }],
			});
		}

		// Stock filter
		if (inStock === "true") {
			query.inStock = true;
			query.stocks = { $gt: 0 };
		}

		// Discount filter
		if (discount) {
			const discountValue = Number.parseInt(discount);
			query.$or = [
				{ discount: { $gte: discountValue } },
				{
					$expr: {
						$gte: [
							{
								$multiply: [
									{
										$divide: [
											{ $subtract: ["$price", "$salePrice"] },
											"$price",
										],
									},
									100,
								],
							},
							discountValue,
						],
					},
				},
			];
		}

		// Type filter
		if (type) {
			query.type = type;
		}

		// Build sort object
		const sortObj = {};
		sortObj[sort] = order === "desc" ? -1 : 1;

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const products = await Product.find(query)
			.propulate("reviews")
			.sort(sortObj)
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await Product.countDocuments(query);
		const totalPages = Math.ceil(total / limit);

		// Transform products for frontend
		const transformedProducts = products.map((product) => ({
			id: product._id.toString(),
			name: product.title,
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
			category: product.category,
			inStock: product.inStock,
			stocks: product.stocks,
			status: product.status,
			type: product.type,
			features: product.features || [],
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
		}));

		return Response.json({
			success: true,
			products: transformedProducts,
			pagination: {
				currentPage: page,
				totalPages,
				totalProducts: total,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
				limit,
			},
		});
	} catch (error) {
		console.error("Products fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}
