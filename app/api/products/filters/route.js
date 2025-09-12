import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/model/Product.js";
import Categories from "@/model/Categories";

export async function GET() {
	await dbConnect();

	try {
		// Get price range
		const priceStats = await Product.aggregate([
			{ $match: { published: true } },
			{
				$group: {
					_id: null,
					minPrice: {
						$min: {
							$cond: [{ $gt: ["$salePrice", 0] }, "$salePrice", "$price"],
						},
					},
					maxPrice: { $max: "$salePrice" },
				},
			},
		]);

		const { minPrice = 0, maxPrice = 10000 } = priceStats[0] || {};

		// Get product counts by category and subcategory
		const productCounts = await Product.aggregate([
			{ $match: { published: true } },
			{
				$group: {
					_id: {
						category: "$category",
						subCategory: "$subCategory",
					},
					count: { $sum: 1 },
				},
			},
		]);

		console.log("Top Product Counts:", productCounts);

		// Create maps for easy lookup
		const categoryCountMap = {};
		const subCategoryCountMap = {};

		productCounts.forEach((item) => {
			const { category, subCategory } = item._id;
			const cat = category.toLowerCase();
			const subCat = subCategory.toLowerCase();
			const count = item.count;

			// Update category count
			if (cat) {
				categoryCountMap[cat] = (categoryCountMap[cat] || 0) + count;
			}

			// Update subcategory count
			if (cat && subCat) {
				if (!subCategoryCountMap[cat]) {
					subCategoryCountMap[cat] = {};
				}
				subCategoryCountMap[cat][subCat] = count;
			}
		});

		console.log("Bottom Product Counts:", productCounts);

		// Get all categories from database
		const dbCategories = await Categories.find({ published: true }).lean();
		console.log(
			"Database categories:",
			dbCategories.map((cat) => cat.name)
		);

		// Update category and subcategory counts in database
		const categoryUpdatePromises = dbCategories.map(async (category) => {
			// Use lowercase for matching
			const normalizedCategoryName = category.name.toLowerCase();
			const categoryCount = categoryCountMap[normalizedCategoryName] || 0;
			console.log(
				`Category "${category.name}" (normalized: "${normalizedCategoryName}") has ${categoryCount} products`
			);

			// Update subcategory counts
			const updatedSubCategories = category.subCategories.map((subCat) => {
				const normalizedSubCatName = subCat.name.toLowerCase();
				const subCatCount =
					subCategoryCountMap[normalizedCategoryName]?.[normalizedSubCatName] ||
					0;
				return {
					...subCat,
					productCount: subCatCount,
				};
			});

			// Update the category document
			return Categories.findByIdAndUpdate(
				category._id,
				{
					productCount: categoryCount,
					subCategories: updatedSubCategories,
				},
				{ new: true }
			);
		});

		// Execute all category updates
		const updatedCategories = await Promise.all(categoryUpdatePromises);

		// Format categories for response
		const formattedCategories = updatedCategories.map((cat) => ({
			id: cat.name,
			label: cat.name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
			count: cat.productCount,
			subCategories: cat.subCategories.map((subCat) => ({
				id: subCat.name,
				label: subCat.name
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" "),
				count: subCat.productCount,
			})),
		}));

		// Get discount range
		const discountStats = await Product.aggregate([
			{
				$match: {
					published: true,
					$or: [{ discount: { $gt: 0 } }, { salePrice: { $gt: 0 } }],
				},
			},
			{
				$addFields: {
					calculatedDiscount: {
						$cond: [
							{ $gt: ["$salePrice", 0] },
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
							"$discount",
						],
					},
				},
			},
			{
				$group: {
					_id: null,
					minDiscount: { $min: "$calculatedDiscount" },
					maxDiscount: { $max: "$calculatedDiscount" },
				},
			},
		]);

		const { minDiscount = 0, maxDiscount = 100 } = discountStats[0] || {};

		// Get available types
		const types = await Product.distinct("type", { published: true });

		// Check stock availability
		const stockStats = await Product.aggregate([
			{ $match: { published: true } },
			{
				$group: {
					_id: null,
					inStockCount: { $sum: { $cond: ["$inStock", 1, 0] } },
					outOfStockCount: { $sum: { $cond: ["$inStock", 0, 1] } },
				},
			},
		]);

		const { inStockCount = 0, outOfStockCount = 0 } = stockStats[0] || {};

		return Response.json({
			success: true,
			filters: {
				priceRange: {
					min: Math.floor(minPrice),
					max: Math.ceil(maxPrice),
				},
				categories: formattedCategories,
				discount: {
					min: Math.floor(minDiscount),
					max: Math.ceil(maxDiscount),
				},
				stock: {
					inStock: inStockCount,
					outOfStock: outOfStockCount,
					total: inStockCount + outOfStockCount,
				},
				types: types.map((type) => ({
					id: type,
					label: type
						.split("-")
						.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
						.join(" "),
				})),
			},
		});
	} catch (error) {
		console.error("Filters fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch filters" },
			{ status: 500 }
		);
	}
}
