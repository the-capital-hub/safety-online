import { dbConnect } from "@/lib/dbConnect.js";
import { attachProductCountsToCategories } from "@/lib/categoryCounts.js";
import { slugify } from "@/lib/slugify.js";
import Category from "@/model/Categories.js";

export async function GET() {
	try {
		await dbConnect();

		// Only published categories
                const cats = await Category.find({ published: true })
                        .sort({ name: 1 })
                        .lean();

                const categoriesWithCounts = await attachProductCountsToCategories(
                        cats,
                        { persist: true }
                );

                const categories = categoriesWithCounts.map((category) => {
                        const categorySlug = slugify(category.slug || category.name);

                        const subCategories = (category.subCategories || [])
                                .filter((subCategory) => subCategory?.published !== false)
                                .map((subCategory) => ({
                                        _id: subCategory._id,
                                        name: subCategory.name,
                                        slug: slugify(subCategory.slug || subCategory.name),
                                        published:
                                                subCategory.published !== undefined
                                                        ? !!subCategory.published
                                                        : true,
                                        productCount: Number(subCategory.productCount) || 0,
                                }));

                        const directProductCount = Number(category.productCount) || 0;
                        const aggregatedProductCount = subCategories.reduce(
                                (total, subCategory) => total + (Number(subCategory.productCount) || 0),
                                0
                        );

                        return {
                                _id: category._id,
                                name: category.name,
                                slug: categorySlug,
                                productCount:
                                        directProductCount > 0
                                                ? directProductCount
                                                : aggregatedProductCount,
                                subCategories,
                                published: true,
                        };
                });

		return Response.json({
			success: true,
			categories,
			message: "Categories fetched successfully",
		});
	} catch (e) {
		console.error("Public categories error:", e);
		return Response.json(
			{ success: false, message: "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}
