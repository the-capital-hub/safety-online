import { dbConnect } from "@/lib/dbConnect.js";
import { attachProductCountsToCategories } from "@/lib/categoryCounts.js";
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

                const categories = categoriesWithCounts.map((category) => ({
                        _id: category._id,
                        name: category.name,
                        productCount: category.productCount || 0,
                        subCategories: category.subCategories || [],
                        published: true,
                }));

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
