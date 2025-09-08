// api/seller/product/getAllProducts/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";
import jwt from "jsonwebtoken";

export async function GET(request) {
	await dbConnect();

	// Get token from cookies
	const token = request.cookies.get("seller-auth-token")?.value;

	if (!token) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 }
		);
	}

	// Verify token
	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	const userId = decoded.userId;

	try {
		const { searchParams } = new URL(request.url);

		// Extract query parameters
		const search = searchParams.get("search");
		const category = searchParams.get("category");
		const minPrice = searchParams.get("minPrice");
		const maxPrice = searchParams.get("maxPrice");
		const discount = searchParams.get("discount");
		const published = searchParams.get("published");
		const inStock = searchParams.get("inStock");
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
		const sort = searchParams.get("sort") || "createdAt";
		const order = searchParams.get("order") || "desc";

		// Build query
		const query = {};
		if (userId) {
			query["sellerId"] = userId;
		}

		// Search filter
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } },
				{ longDescription: { $regex: search, $options: "i" } },
			];
		}

		// Category filter
		if (category && category !== "all") {
			query.category = category;
		}

		// Price range filter
		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = Number.parseInt(minPrice);
			if (maxPrice) query.price.$lte = Number.parseInt(maxPrice);
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

		// Published filter
		if (published !== null && published !== undefined) {
			query.published = published === "true";
		}

		// Stock filter
		if (inStock === "true") {
			query.inStock = true;
			query.stocks = { $gt: 0 };
		}

		// Build sort object
		const sortObj = {};
		sortObj[sort] = order === "desc" ? -1 : 1;

		// Execute query with pagination
		const skip = (page - 1) * limit;
		const products = await Product.find(query)
			.sort(sortObj)
			.skip(skip)
			.limit(limit)
			.lean();

		const total = await Product.countDocuments(query);
		const totalPages = Math.ceil(total / limit);

		// Get category counts for filters
		const categoryStats = await Product.aggregate([
			{ $group: { _id: "$category", count: { $sum: 1 } } },
		]);

		// Get price range
		const priceStats = await Product.aggregate([
			{
				$group: {
					_id: null,
					minPrice: { $min: "$price" },
					maxPrice: { $max: "$price" },
				},
			},
		]);

		return Response.json({
			success: true,
			products,
			pagination: {
				currentPage: page,
				totalPages,
				totalProducts: total,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
				limit,
			},
			filters: {
				categories: categoryStats,
				priceRange: priceStats[0] || { minPrice: 0, maxPrice: 10000 },
			},
		});
	} catch (error) {
		console.error("Seller products fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch products" },
			{ status: 500 }
		);
	}
}
