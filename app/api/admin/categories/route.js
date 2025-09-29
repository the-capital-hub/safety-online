// // app/api/admin/categories/route.js

// import { dbConnect } from "@/lib/dbConnect.js";
// import Category from "@/model/Categories.js";
// import Product from "@/model/Product.js";

// export async function GET(request) {
// 	await dbConnect();

// 	try {
// 		const { searchParams } = new URL(request.url);

// 		const search = searchParams.get("search");
// 		const published = searchParams.get("published");
// 		const page = Number.parseInt(searchParams.get("page") || "1");
// 		const limit = Number.parseInt(searchParams.get("limit") || "10");
// 		const sort = searchParams.get("sort") || "createdAt";
// 		const order = searchParams.get("order") || "desc";

// 		// Build query
// 		const query = {};

// 		if (search) {
// 			query.$or = [
// 				{ name: { $regex: search, $options: "i" } },
// 				{ description: { $regex: search, $options: "i" } },
// 			];
// 		}

// 		if (published !== null && published !== undefined) {
// 			query.published = published === "true";
// 		}

// 		// Build sort object
// 		const sortObj = {};
// 		sortObj[sort] = order === "desc" ? -1 : 1;

// 		// Execute query with pagination
// 		const skip = (page - 1) * limit;
// 		const categories = await Category.find(query)
// 			.sort(sortObj)
// 			.skip(skip)
// 			.limit(limit)
// 			.lean();

// 		// Update product counts for each category
// 		for (const category of categories) {
// 			const productCount = await Product.countDocuments({
// 				category: category.slug,
// 				published: true,
// 			});
// 			await Category.findByIdAndUpdate(category._id, { productCount });
// 			category.productCount = productCount;
// 		}

// 		const total = await Category.countDocuments(query);
// 		const totalPages = Math.ceil(total / limit);

// 		return Response.json({
// 			success: true,
// 			categories,
// 			pagination: {
// 				currentPage: page,
// 				totalPages,
// 				totalCategories: total,
// 				hasNextPage: page < totalPages,
// 				hasPrevPage: page > 1,
// 				limit,
// 			},
// 		});
// 	} catch (error) {
// 		console.error("Categories fetch error:", error);
// 		return Response.json(
// 			{ success: false, message: "Failed to fetch categories" },
// 			{ status: 500 }
// 		);
// 	}
// }

// export async function POST(request) {
// 	await dbConnect();

// 	try {
// 		const { name, description, icon, published, sortOrder } =
// 			await request.json();

// 		if (!name || !description) {
// 			return Response.json(
// 				{ success: false, message: "Name and description are required" },
// 				{ status: 400 }
// 			);
// 		}

// 		const category = new Category({
// 			name,
// 			description,
// 			icon: icon || "",
// 			published: published !== undefined ? published : true,
// 			sortOrder: sortOrder || 0,
// 		});

// 		await category.save();

// 		return Response.json({
// 			success: true,
// 			message: "Category created successfully",
// 			category,
// 		});
// 	} catch (error) {
// 		if (error.code === 11000) {
// 			return Response.json(
// 				{ success: false, message: "Category name already exists" },
// 				{ status: 400 }
// 			);
// 		}
// 		console.error("Create category error:", error);
// 		return Response.json(
// 			{ success: false, message: "Failed to create category" },
// 			{ status: 500 }
// 		);
// 	}
// }

// export async function PUT(request) {
// 	await dbConnect();

// 	try {
// 		const { categoryId, ...updateData } = await request.json();

// 		if (!categoryId) {
// 			return Response.json(
// 				{ success: false, message: "Category ID is required" },
// 				{ status: 400 }
// 			);
// 		}

// 		const category = await Category.findByIdAndUpdate(categoryId, updateData, {
// 			new: true,
// 		});

// 		if (!category) {
// 			return Response.json(
// 				{ success: false, message: "Category not found" },
// 				{ status: 404 }
// 			);
// 		}

// 		return Response.json({
// 			success: true,
// 			message: "Category updated successfully",
// 			category,
// 		});
// 	} catch (error) {
// 		console.error("Update category error:", error);
// 		return Response.json(
// 			{ success: false, message: "Failed to update category" },
// 			{ status: 500 }
// 		);
// 	}
// }

// export async function DELETE(request) {
// 	await dbConnect();

// 	try {
// 		const { categoryId, categoryIds } = await request.json();

// 		if (categoryIds && Array.isArray(categoryIds)) {
// 			// Bulk delete
// 			const result = await Category.deleteMany({ _id: { $in: categoryIds } });
// 			return Response.json({
// 				success: true,
// 				message: `${result.deletedCount} categories deleted successfully`,
// 				deletedCount: result.deletedCount,
// 			});
// 		} else if (categoryId) {
// 			// Single delete
// 			const category = await Category.findByIdAndDelete(categoryId);
// 			if (!category) {
// 				return Response.json(
// 					{ success: false, message: "Category not found" },
// 					{ status: 404 }
// 				);
// 			}
// 			return Response.json({
// 				success: true,
// 				message: "Category deleted successfully",
// 			});
// 		} else {
// 			return Response.json(
// 				{ success: false, message: "Category ID(s) required" },
// 				{ status: 400 }
// 			);
// 		}
// 	} catch (error) {
// 		console.error("Delete category error:", error);
// 		return Response.json(
// 			{ success: false, message: "Failed to delete category" },
// 			{ status: 500 }
// 		);
// 	}
// }

// app/api/admin/categories/route.js

import { dbConnect } from "@/lib/dbConnect.js";
import { attachProductCountsToCategories } from "@/lib/categoryCounts.js";
import Category from "@/model/Categories.js";

const normalizeNavigationOrder = (value) => {
        const parsed = Number(value);

        if (!Number.isFinite(parsed) || parsed < 0) {
                return 0;
        }

        return Math.floor(parsed);
};

export async function GET(request) {
	await dbConnect();

	try {
		const { searchParams } = new URL(request.url);

		const search = searchParams.get("search");
		const published = searchParams.get("published");
		const page = Number.parseInt(searchParams.get("page") || "1");
		const limit = Number.parseInt(searchParams.get("limit") || "10");
                const sort = searchParams.get("sort") || "navigationOrder";
		const order = searchParams.get("order") || "desc";

		const query = {};

		if (search) {
			const regex = { $regex: search, $options: "i" };
			query.$or = [{ name: regex }, { "subCategories.name": regex }];
		}

		if (published !== null && published !== undefined) {
			query.published = published === "true";
		}

                const sortObj = {};
                sortObj[sort] = order === "desc" ? -1 : 1;
                if (sort !== "navigationOrder") {
                        sortObj.navigationOrder = 1;
                } else {
                        sortObj.name = 1;
                }

		const skip = (page - 1) * limit;
                const categories = await Category.find(query)
                        .sort(sortObj)
                        .skip(skip)
                        .limit(limit)
                        .lean();

                const normalizedCategories = await attachProductCountsToCategories(
                        categories,
                        { persist: true }
                );

                const categoriesWithNormalizedOrder = normalizedCategories.map(
                        (category) => ({
                                ...category,
                                navigationOrder: normalizeNavigationOrder(
                                        category.navigationOrder
                                ),
                        })
                );

                const total = await Category.countDocuments(query);
                const totalPages = Math.ceil(total / limit);

                return Response.json({
                        success: true,
                        categories: categoriesWithNormalizedOrder,
			pagination: {
				currentPage: page,
				totalPages,
				totalCategories: total,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1,
				limit,
			},
		});
	} catch (error) {
		console.error("Categories fetch error:", error);
		return Response.json(
			{ success: false, message: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}

export async function POST(request) {
	await dbConnect();

	try {
		const body = await request.json();
                let {
                        name,
                        published = true,
                        subCategories = [],
                        navigationOrder = 0,
                } = body || {};

		if (!name || typeof name !== "string" || name.trim() === "") {
			return Response.json(
				{ success: false, message: "Name is required" },
				{ status: 400 }
			);
		}

		// Normalize the category name (trim and lowercase)
		name = name.trim().toLowerCase();

		// Check if category with this name already exists
		const existingCategory = await Category.findOne({ name });
		if (existingCategory) {
			return Response.json(
				{ success: false, message: "Category name already exists" },
				{ status: 400 }
			);
		}

		// Normalize subCategories array
                const normalizedSubs = Array.isArray(subCategories)
                        ? subCategories
                                        .filter(
                                                (s) => s && typeof s.name === "string" && s.name.trim() !== ""
                                        )
                                        .map((s) => ({
                                                name: s.name.trim().toLowerCase(),
                                                published:
                                                        s.published !== undefined
                                                                ? !!s.published
                                                                : true,
                                        }))
                        : [];


                const category = new Category({
                        name,
                        published: !!published,
                        subCategories: normalizedSubs,

                        navigationOrder: normalizeNavigationOrder(navigationOrder),

                });

		await category.save();

		return Response.json({
			success: true,
			message: "Category created successfully",
			category,
		});
	} catch (error) {
		console.error("Create category error:", error);

		if (error.code === 11000) {
			// Duplicate key error
			return Response.json(
				{ success: false, message: "Category name already exists" },
				{ status: 400 }
			);
		}

		return Response.json(
			{ success: false, message: "Failed to create category" },
			{ status: 500 }
		);
	}
}

export async function PUT(request) {
        await dbConnect();

        try {
                const body = await request.json();
                const { categoryId, ...updateData } = body || {};

                if (!categoryId) {
                        return Response.json(
                                { success: false, message: "Category ID is required" },
                                { status: 400 }
                        );
                }

                const category = await Category.findById(categoryId);

                if (!category) {
                        return Response.json(
                                { success: false, message: "Category not found" },
                                { status: 404 }
                        );
                }

                const updates = {};

                if (typeof updateData.name === "string") {
                        const trimmedName = updateData.name.trim();
                        if (trimmedName.length > 0) {
                                updates.name = trimmedName;
                        }
                }

                if (typeof updateData.published === "boolean") {
                        updates.published = updateData.published;
                }

                if (Array.isArray(updateData.subCategories)) {
                        updates.subCategories = updateData.subCategories
                                .filter((s) => s && typeof s.name === "string" && s.name.trim() !== "")
                                .map((s) => ({
                                        name: s.name.trim(),
                                        published:
                                                s.published !== undefined
                                                        ? !!s.published
                                                        : true,
                                        productCount: Number(s.productCount) || 0,
                                }));
                }

                if (typeof updateData.productCount === "number") {
                        updates.productCount = updateData.productCount;
                }

                if (updateData.navigationOrder !== undefined) {
                        updates.navigationOrder = normalizeNavigationOrder(
                                updateData.navigationOrder
                        );
                }

                if (Object.keys(updates).length === 0) {
                        return Response.json(
                                {
                                        success: false,
                                        message: "No valid fields provided for update",
                                },
                                { status: 400 }
                        );
                }

                Object.assign(category, updates);

                await category.save();

                const [categoryWithCounts] = await attachProductCountsToCategories([
                        category.toObject(),
                ]);

                const normalizedCategory = categoryWithCounts
                        ? {
                                  ...categoryWithCounts,
                                  _id: category._id.toString(),
                                  navigationOrder: normalizeNavigationOrder(
                                          categoryWithCounts.navigationOrder
                                  ),
                          }
                        : {
                                  ...category.toObject(),
                                  _id: category._id.toString(),
                                  navigationOrder: normalizeNavigationOrder(category.navigationOrder),
                          };

                return Response.json({
                        success: true,
                        message: "Category updated successfully",
                        category: normalizedCategory,
                });
        } catch (error) {
                console.error("Update category error:", error);
                return Response.json(
                        { success: false, message: "Failed to update category" },
                        { status: 500 }
                );
        }
}

export async function DELETE(request) {
	await dbConnect();

	try {
		const { categoryId, categoryIds } = await request.json();

		if (categoryIds && Array.isArray(categoryIds)) {
			const result = await Category.deleteMany({ _id: { $in: categoryIds } });
			return Response.json({
				success: true,
				message: `${result.deletedCount} categories deleted successfully`,
				deletedCount: result.deletedCount,
			});
		} else if (categoryId) {
			const category = await Category.findByIdAndDelete(categoryId);
			if (!category) {
				return Response.json(
					{ success: false, message: "Category not found" },
					{ status: 404 }
				);
			}
			return Response.json({
				success: true,
				message: "Category deleted successfully",
			});
		} else {
			return Response.json(
				{ success: false, message: "Category ID(s) required" },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Delete category error:", error);
		return Response.json(
			{ success: false, message: "Failed to delete category" },
			{ status: 500 }
		);
	}
}
